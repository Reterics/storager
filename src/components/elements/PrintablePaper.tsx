import {RefObject} from 'react';
import {PDFData} from '../../interfaces/pdf.ts';

const PrintablePaper = ({
  data,
  ref,
  children,
}: {
  data: PDFData;
  ref: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) => {
  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '20mm',
        paddingTop: '0mm',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12pt',
        backgroundColor: '#ffffff',
      }}
    >
      {data.map((row, rowIndex) => (
        <div key={rowIndex} style={{marginBottom: '10pt'}}>
          {Array.isArray(row) ? (
            row.length > 1 ? (
              // Multiple columns in this row
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                {row.map((col, colIndex) => (
                  <div key={colIndex} style={{width: '48%', textAlign: 'left'}}>
                    {typeof col === 'object' ? (
                      <span>
                        <strong>{Object.keys(col)[0]}:</strong>{' '}
                        {col[Object.keys(col)[0]]}
                      </span>
                    ) : (
                      <span>{col}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Single column
              <div style={{textAlign: 'left'}}>
                {typeof row[0] === 'object' ? (
                  <span>
                    <strong>{Object.keys(row[0])[0]}:</strong>{' '}
                    {row[0][Object.keys(row[0])[0]]}
                  </span>
                ) : (
                  <span>{row[0]}</span>
                )}
              </div>
            )
          ) : (
            // Row is not an array
            <div
              style={{
                textAlign: typeof row === 'object' ? 'center' : 'left',
                fontWeight: typeof row === 'object' ? 'bold' : 'normal',
              }}
            >
              {typeof row === 'object' ? (
                <span>
                  {Object.keys(row)[0] && (
                    <strong>{Object.keys(row)[0]}: </strong>
                  )}

                  {row[Object.keys(row)[0]]}
                </span>
              ) : (
                <pre>{row}</pre>
              )}
            </div>
          )}
        </div>
      ))}
      {children}
    </div>
  );
};

export default PrintablePaper;
