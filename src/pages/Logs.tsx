import {useContext, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import {Shop} from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import {PageHead} from '../components/elements/PageHead.tsx';
import {LogEntry} from '../database/firebase/FirebaseDBModel.ts';
import {getBrowserInfo} from '../utils/data.ts';
import {formatChanges} from '../utils/print.tsx';
import {BsCheck, BsX} from 'react-icons/bs';
import {firebaseModel} from '../database/firebase/config.ts';
import {CommonCollectionData, ContextDataType} from '../interfaces/firebase.ts';
import {getIconForDeviceType} from '../utils/typedIcons.tsx';

export default function Logs() {
  const dbContext = useContext(DBContext);
  const {t} = useTranslation();
  const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

  const dataKeys: {
    [key: string]: Record<string, string>;
  } = {};

  const filterItems = (shopFilter: string | undefined) => {
    let items = dbContext?.data.logs ?? [];

    if (shopFilter) {
      const filteredShopId = shops.find((shop) => shop.name === shopFilter)?.id;
      if (filteredShopId) {
        items = items.filter((item) => {
          return item.shop_id && item.shop_id.includes(filteredShopId);
        });
      }
    }

    items.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));

    return items;
  };

  const [shopFilter, setShopFilter] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>(filterItems(shopFilter));

  const selectShopFilter = (shop: string) => {
    setShopFilter(shop);
    setLogs(filterItems(shop));
  };

  const deleteLog = async (item: LogEntry) => {
    if (
      item.id &&
      window.confirm(t('Are you sure you wish to delete this Log?'))
    ) {
      const updatedItems = (await dbContext?.removeData(
        'logs',
        item.id
      )) as LogEntry[];
      setLogs(updatedItems);
    }
  };

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  if (!firebaseModel.isLoggingActive()) {
    return <div>Logging is not active in the system.</div>;
  }
  const tableLines = logs.map((log) => {
    let entityName = (log.item_name && log.entity) || '';
    if (!log.item_name && log.entity) {
      const [type, id] = log.entity.split('/');
      if (type && !dataKeys[type]) {
        dataKeys[type] = (
          (dbContext?.data?.[type as ContextDataType] ||
            []) as CommonCollectionData[]
        ).reduce(
          (out, currentValue) => {
            out[currentValue.id] = (currentValue.name || '') as string;
            return out;
          },
          {} as Record<string, string>
        );
      }
      if (type && id && dataKeys[type][id]) {
        entityName = dataKeys[type][id] as string;
      }
    }

    const assignedShops = log?.shop_id
      ?.map((id) => shops.find((shop) => shop.id === id))
      .filter((a) => a) as Shop[];

    const browserInfo = log.user_agent
      ? getBrowserInfo(log.user_agent)
      : undefined;
    const array = [
      <span title={log.entity}>{entityName?.substring(0, 11)}</span>,
      <div className='flex items-center' title={log.error}>
        {log.action}{' '}
        {log.error ? (
          <BsX className='text-lg text-red-500' />
        ) : (
          <BsCheck className='text-lg text-green-500' />
        )}
      </div>,
      log.email || log.uid,
      getIconForDeviceType(log.device_type),
      <span
        title={log.user_agent + '\n' + log.device_info}
        onClick={() => {
          if (!log.device_info) {
            return alert(log.user_agent);
          }
          const message = `
Language: ${log.device_info.language}
CPU Cores: ${log.device_info.hardwareConcurrency}
Device Pixel Ratio: ${log.device_info.devicePixelRatio}

Screen:
  Width: ${log.device_info.screen.width}
  Height: ${log.device_info.screen.height}
  Avail Width: ${log.device_info.screen.availWidth}
  Avail Height: ${log.device_info.screen.availHeight}
  Orientation: ${log.device_info.screen.orientation}

Viewport:
  Inner Width: ${log.device_info.viewport.innerWidth}
  Inner Height: ${log.device_info.viewport.innerHeight}
`.trim();
          alert(message);
        }}
      >
        {browserInfo?.name || log.user_agent?.substring(0, 11)}{' '}
        {browserInfo?.isMobile ? '(Mobile)' : '(Web)'}
      </span>,
      log.changes
        ? formatChanges(
            log.changes as {[key: string]: {from: string; to: string}}
          )
        : 'No changes',
      assignedShops?.length
        ? assignedShops.map((a) => a.name).join(', ')
        : t('Minden bolt'),
      new Date(log.at || log.docUpdated!)
        .toISOString()
        .replace(/T/, ' ')
        .split('.')[0],
      TableViewActions({
        onRemove: () => deleteLog(log),
      }),
    ];

    array[-1] = log.error;
    return array;
  });

  return (
    <>
      <PageHead
        title={t('Logs')}
        shopFilter={shopFilter}
        setShopFilter={selectShopFilter}
      />

      <TableViewComponent
        lines={tableLines}
        isHighlighted={(item) => {
          return !!item[-1];
        }}
        header={[
          t('Entity'),
          t('Action'),
          t('Email / UID'),
          t('Device'),
          t('User Agent'),
          t('Changes'),
          t('Shop'),
          t('Date'),
          t('Actions'),
        ]}
      />
    </>
  );
}
