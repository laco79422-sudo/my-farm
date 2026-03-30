import { useMemo, useState } from 'react';
import type { DailyLogDoc } from '../../types';
import { formatDateLabel, formatDateShort } from '../../utils/format';
import './JournalTimeline.css';

interface Props {
  logs: DailyLogDoc[];
  title?: string;
}

/** 생산일지 — 썸네일 스트립 + 세로 타임라인 */
export function JournalTimeline({ logs, title = '생산일지' }: Props) {
  const sorted = useMemo(
    () =>
      [...logs].sort(
        (a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime(),
      ),
    [logs],
  );

  const [activeId, setActiveId] = useState<string | null>(() => sorted[0]?.logId ?? null);

  if (sorted.length === 0) {
    return (
      <div className="journal">
        <p className="muted" style={{ margin: 0 }}>
          등록된 일지가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="journal">
      <div className="journal__heading">
        <h3>{title}</h3>
        <p className="journal__sub">최신순 · 썸네일을 누르면 해당 항목으로 포커스</p>
      </div>

      <div className="journal__strip-wrap">
        <div className="journal__strip" role="tablist" aria-label="일지 날짜별 썸네일">
          {sorted.map((log) => (
            <div key={log.logId} className="journal__thumb">
              <button
                type="button"
                role="tab"
                aria-selected={activeId === log.logId}
                className={
                  'journal__thumb-btn' + (activeId === log.logId ? ' journal__thumb-btn--active' : '')
                }
                onClick={() => setActiveId(log.logId)}
              >
                <img src={log.imageUrl} alt="" />
              </button>
              <time>{formatDateShort(String(log.date))}</time>
            </div>
          ))}
        </div>
      </div>

      <ul className="journal__list">
        {sorted.map((log) => (
          <li
            key={log.logId}
            id={`log-${log.logId}`}
            className={
              'journal__item' + (activeId === log.logId ? ' journal__item--active' : '')
            }
          >
            <span className="journal__dot" aria-hidden />
            <div className="journal__row">
              <div className="journal__mini">
                <img src={log.imageUrl} alt="" />
              </div>
              <div>
                <div className="journal__date">{formatDateLabel(String(log.date))}</div>
                <p className="journal__memo">{log.memo}</p>
                {log.pointsGranted && <span className="journal__badge">+50P 일지 보상</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
