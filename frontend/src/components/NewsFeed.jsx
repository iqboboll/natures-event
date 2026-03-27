export default function NewsFeed() {
  const news = [
    { time: '2 MIN AGO',  text: 'Heavy rain detected in Kuala Lumpur — 45mm recorded in the last hour.',            tag: 'FLOOD', tagColor: 'var(--accent-blue)' },
    { time: '18 MIN AGO', text: 'Minor tremor (2.1 magnitude) reported near Ranau fault line, Sabah.',              tag: 'SEISMIC', tagColor: 'var(--accent-red)' },
    { time: '35 MIN AGO', text: 'NADMA issues advisory for coastal areas in Terengganu ahead of monsoon surge.',    tag: 'MONSOON', tagColor: 'var(--accent-gold)' },
    { time: '1 HOUR AGO', text: 'Kelantan River level rising — current reading 8.2m (danger level: 9.0m).',         tag: 'FLOOD', tagColor: 'var(--accent-blue)' },
    { time: '1.5H AGO',   text: 'Satellite imagery detects cloud formation consistent with cyclonic activity.',      tag: 'WEATHER', tagColor: 'var(--accent-purple)' },
    { time: '2 HOURS AGO',text: 'Air quality index in Muar reaches 158 (Unhealthy). Open burning suspected.',       tag: 'AIR', tagColor: 'var(--accent-orange)' },
    { time: '3 HOURS AGO',text: 'JPS deploys portable pumps to Shah Alam drainage system.',                         tag: 'RESPONSE', tagColor: 'var(--accent-green)' },
    { time: '4 HOURS AGO',text: 'DID reports 312 river monitoring stations active across Peninsular Malaysia.',      tag: 'SENSORS', tagColor: 'var(--accent-cyan)' },
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-header__title">AI Live News Feed</span>
        <span className="panel-header__badge panel-header__badge--live">LIVE</span>
      </div>
      <div className="panel-body">
        {news.map((n, i) => (
          <div className="news-item fade-in" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="news-item__time">{n.time}</div>
            <div className="news-item__text">{n.text}</div>
            <span
              className="news-item__tag"
              style={{ background: `${n.tagColor}22`, color: n.tagColor }}
            >
              {n.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
