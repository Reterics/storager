import { useContext, useMemo, useState } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { useTranslation } from 'react-i18next';
import type { Shop } from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import { PageHead } from '../components/elements/PageHead.tsx';
import type { LogEntry } from '../database/firebase/FirebaseDBModel.ts';
import { getBrowserInfo } from '../utils/data.ts';
import { formatChanges } from '../utils/print.tsx';
import { BsCheck, BsX } from 'react-icons/bs';
import { firebaseModel } from '../database/firebase/config.ts';
import type {
  CommonCollectionData,
  ContextDataType,
} from '../interfaces/firebase.ts';
import { getIconForDeviceType } from '../utils/typedIcons.tsx';
import { MiniTopChart } from '../components/elements/MiniTopChart.tsx';

export default function Logs() {
  const dbContext = useContext(DBContext);
  const { t } = useTranslation();
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

  const [tableLimits, setTableLimits] = useState<number>(100);
  const [shopFilter, setShopFilter] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>(filterItems(shopFilter));

  const last24hData = useMemo(() => {
    // Align end to nearest 15 minutes
    const end = new Date();
    end.setMinutes(Math.floor(end.getMinutes() / 15) * 15, 0, 0);

    const buckets: {
      label: string;
      start: number;
      end: number;
      count: number;
    }[] = [];

    // Create 96 buckets (24 hours * 4 per hour)
    for (let i = 95; i >= 0; i--) {
      const start = new Date(end);
      start.setMinutes(end.getMinutes() - i * 15);

      const bucketStart = new Date(start);
      const bucketEnd = new Date(start);
      bucketEnd.setMinutes(bucketEnd.getMinutes() + 15);

      const label = `${String(bucketStart.getHours()).padStart(2, '0')}:${String(
        bucketStart.getMinutes(),
      ).padStart(2, '0')}`;

      buckets.push({
        label,
        start: bucketStart.getTime(),
        end: bucketEnd.getTime(),
        count: 0,
      });
    }

    for (const log of logs) {
      const ts = (log.at ?? log.docUpdated) || 0;
      if (!ts) continue;
      for (let i = 0; i < buckets.length; i++) {
        const b = buckets[i];
        if (ts >= b.start && ts < b.end) {
          b.count++;
          break;
        }
      }
    }

    return buckets.map((b) => ({ time: b.label, count: b.count }));
  }, [logs]);

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
        item.id,
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
          {} as Record<string, string>,
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
      <div className="flex items-center" title={log.error}>
        {log.action}{' '}
        {log.error ? (
          <BsX className="text-lg text-red-500" />
        ) : (
          <BsCheck className="text-lg text-green-500" />
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
            log.changes as { [key: string]: { from: string; to: string } },
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
        tableLimits={tableLimits}
        setTableLimits={setTableLimits}
        shopFilter={shopFilter}
        setShopFilter={selectShopFilter}
      />

      <div className="flex w-full justify-center mb-2 mt-1">
        <MiniTopChart
          data={last24hData}
          xKey="time"
          yKey="count"
          kind="bar"
          className="text-zinc-700"
        />
      </div>

      <TableViewComponent
        lines={tableLines}
        isHighlighted={(item) => {
          return !!item[-1];
        }}
        tableLimits={tableLimits}
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
