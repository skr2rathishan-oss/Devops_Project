function OverviewCards() {
  return (
    <section className="overview-grid">
      <div className="overview-card">
        <div className="overview-icon">✓</div>

        <div>
          <p>Total Tasks</p>
          <h2>24</h2>
          <span>8 completed</span>
        </div>
      </div>

      <div className="overview-card">
        <div className="overview-icon">◷</div>

        <div>
          <p>In Progress</p>
          <h2>7</h2>
          <span>Currently active</span>
        </div>
      </div>

      <div className="overview-card">
        <div className="overview-icon">⚑</div>

        <div>
          <p>Pending</p>
          <h2>9</h2>
          <span>Waiting to start</span>
        </div>
      </div>

      <div className="overview-card deadline-card">
        <div className="overview-icon">📅</div>

        <div>
          <p>Upcoming Deadlines</p>
          <h2>5</h2>
          <span>Next 7 days</span>
        </div>
      </div>
    </section>
  );
}

export default OverviewCards;