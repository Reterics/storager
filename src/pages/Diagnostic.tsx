import type { JSX } from 'react';
import { useContext, useState } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { useTranslation } from 'react-i18next';
import type {
  ServiceCompleteData,
  ServiceData,
} from '../interfaces/interfaces.ts';
import { serviceStatusList } from '../interfaces/interfaces.ts';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import type { ContextDataType } from '../interfaces/firebase.ts';
import { PageHead } from '../components/elements/PageHead.tsx';

interface Occurrence {
  source: ContextDataType;
  docType: ContextDataType;
  client_name: string;
  date?: string;
  inconsistentOccurrence?: boolean; // This will be marked after we determine majority
}

interface InconsistencyResult {
  service_id: string;
  occurrences: Occurrence[];
  distinctClientNames: string[];
  inconsistent: boolean;
}

function sortInconsistencyResultsByLastOccurrenceDate(
  results: InconsistencyResult[],
): InconsistencyResult[] {
  return results.sort((a, b) => {
    // Find the latest date for 'a'
    const aLatest = a.occurrences
      .map((o) => new Date(o.date ?? 0))
      .reduce(
        (latest, current) => (current > latest ? current : latest),
        new Date(0),
      );

    // Find the latest date for 'b'
    const bLatest = b.occurrences
      .map((o) => new Date(o.date ?? 0))
      .reduce(
        (latest, current) => (current > latest ? current : latest),
        new Date(0),
      );

    // Sort descending by the latest occurrence date
    return bLatest.getTime() - aLatest.getTime();
  });
}

function markInconsistentOccurrences(
  results: InconsistencyResult[],
): InconsistencyResult[] {
  return results.map((result) => {
    if (!result.inconsistent) {
      // If there's no inconsistency at all, no need to mark any occurrences
      return result;
    }

    // Count occurrences of each client_name
    const nameCount: Record<string, number> = {};
    for (const occ of result.occurrences) {
      nameCount[occ.client_name] = (nameCount[occ.client_name] || 0) + 1;
    }

    // Find the maximum occurrence count
    const maxCount = Math.max(...Object.values(nameCount));
    // Identify which name(s) have the maxCount
    const majorityNames = Object.entries(nameCount)

      .filter(([_, count]) => count === maxCount)
      .map(([name]) => name);

    // If more than one name shares the maxCount, we have a tie.
    // In that case, consider all occurrences inconsistent.
    const isTie = majorityNames.length > 1;
    result.occurrences = result.occurrences.map((occ) => {
      if (!majorityNames.includes(occ.client_name) || isTie) {
        occ.inconsistentOccurrence = true;
      } else {
        occ.inconsistentOccurrence = false;
      }
      return occ;
    });

    return result;
  });
}

function findClientNameInconsistencies(
  services: ServiceData[],
  completionForms: ServiceCompleteData[],
  archive: (ServiceData | ServiceCompleteData)[],
): InconsistencyResult[] {
  // Aggregate all client_names by service_id
  const occurrencesMap: Record<string, Occurrence[]> = {};

  // Add from services
  for (const srv of services) {
    if (srv.client_name) {
      const occ: Occurrence = {
        source: 'services',
        docType: 'services',
        client_name: srv.client_name,
        date: srv.date,
      };
      if (!occurrencesMap[srv.id]) occurrencesMap[srv.id] = [];
      occurrencesMap[srv.id].push(occ);
    }
  }

  // Add from completion forms
  for (const form of completionForms) {
    if (form.service_id && form.client_name) {
      const occ: Occurrence = {
        source: 'completions',
        docType: 'completions',
        client_name: form.client_name,
        date: form.date,
      };
      if (!occurrencesMap[form.service_id])
        occurrencesMap[form.service_id] = [];
      occurrencesMap[form.service_id].push(occ);
    }
  }

  // Add from archive (both docType 'service' and 'completion' relate to the same service_id)
  for (const doc of archive) {
    if (doc.docParent && doc.client_name) {
      const occ: Occurrence = {
        source: 'archive',
        docType: 'archive',
        client_name: doc.client_name,
        date: doc.date,
      };
      if (!occurrencesMap[doc.docParent]) occurrencesMap[doc.docParent] = [];
      occurrencesMap[doc.docParent].push(occ);
    }
  }

  // Now we have a map of service_id to all encountered client_names
  // Check for inconsistencies
  const results: InconsistencyResult[] = Object.keys(occurrencesMap).map(
    (service_id) => {
      const occs = occurrencesMap[service_id];
      const distinctNames = Array.from(new Set(occs.map((o) => o.client_name)));
      return {
        service_id,
        occurrences: occs,
        distinctClientNames: distinctNames,
        inconsistent: distinctNames.length > 1,
      };
    },
  );

  return results.filter((r) => r.inconsistent);
}

function Diagnostic() {
  const dbContext = useContext(DBContext);
  const { t } = useTranslation();

  const buildTime = Number(import.meta.env.BUILD_TIME || new Date().getTime());

  const [servicedItems] = useState<ServiceData[]>(
    dbContext?.data.services || [],
  );
  const [completionForms] = useState<ServiceCompleteData[]>(
    dbContext?.data.completions || [],
  );

  const [modalTemplate] = useState<ServiceData | null>(null);

  const inconsistencies = markInconsistentOccurrences(
    findClientNameInconsistencies(
      servicedItems,
      completionForms,
      dbContext?.data.archive || [],
    ),
  );
  sortInconsistencyResultsByLastOccurrenceDate(inconsistencies);

  const sinceLastBuild = inconsistencies.reduce((total, inconsistency) => {
    total += inconsistency.occurrences.filter(
      (o) => new Date(o.date ?? 0).getTime() > buildTime,
    ).length
      ? 1
      : 0;
    return total;
  }, 0);

  const tableLines = inconsistencies.reduce(
    (tableLines, inconsistency) => {
      const serviceItem = servicedItems.find(
        (service) => service.id === inconsistency.service_id,
      );
      const issueAfterRelease = inconsistency.occurrences.filter(
        (o) => new Date(o.date ?? 0).getTime() > buildTime,
      ).length;

      inconsistency.occurrences.forEach((occurence, index) => {
        tableLines.push([
          !index ? inconsistency.service_id : '',
          occurence.inconsistentOccurrence ? (
            <div
              className={
                issueAfterRelease
                  ? 'w-full h-full bg-red-200 text-gray-800'
                  : 'w-full h-full bg-amber-200 text-gray-800'
              }
            >
              {occurence.client_name}
            </div>
          ) : (
            occurence.client_name
          ),
          t(serviceItem?.serviceStatus || serviceStatusList[0]),
          t(serviceItem?.guaranteed || 'no'),
          serviceItem?.expected_cost || 0,
          occurence.date || '',
          TableViewActions({
            /*onEdit: () => {
                        setModalTemplate({...item, onUpdate: true});
                        if (selectedServiceLines) {
                            setSelectedServiceLines(null);
                        }
                    },*/
          }),
        ]);
      });
      return tableLines;
    },
    [] as (string | number | JSX.Element | undefined)[][],
  );

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  const noModalActive = !modalTemplate;

  return (
    <>
      {noModalActive && (
        <PageHead
          title={t('Service Diagnostic')}
          error={sinceLastBuild + t(' inconsistencies since last build')}
        />
      )}

      {noModalActive && (
        <TableViewComponent
          lines={tableLines}
          header={[
            t('ID'),
            t('Names'),
            {
              value: t('status'),
              type: 'text',
              sortable: false,
              editable: false,
            },
            {
              value: t('Guaranteed'),
              type: 'text',
              sortable: false,
              editable: false,
            },
            {
              value: t('Expected cost'),
              type: 'number',
              postFix: ' Ft',
              sortable: false,
              editable: false,
            },
            {
              value: t('Date'),
              type: 'text',
              sortable: false,
              editable: false,
            },
            t('Actions'),
          ]}
        />
      )}

      <div className="relative flex justify-center w-full m-auto flex-1 no-print"></div>
    </>
  );
}

export default Diagnostic;
