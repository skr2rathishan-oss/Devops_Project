function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <div className="right-title">
        <h3>Team Activity</h3>
        <button>•••</button>
      </div>

      <div className="activity">
        <div className="activity-avatar">SM</div>

        <div>
          <p>
            <strong>Team Member</strong> moved
            <b> Dashboard UI</b> to In Progress.
          </p>

          <span>10 minutes ago</span>
        </div>
      </div>

      <div className="activity">
        <div className="activity-avatar">AK</div>

        <div>
          <p>
            <strong>Alex</strong> completed
            <b> Navigation Component</b>.
          </p>

          <span>45 minutes ago</span>
        </div>
      </div>

      <div className="activity">
        <div className="activity-avatar">JD</div>

        <div>
          <p>
            <strong>John</strong> added a comment to
            <b> REST API</b>.
          </p>

          <span>1 hour ago</span>
        </div>
      </div>

      <div className="notes">
        <h3>Quick Notes</h3>

        <textarea placeholder="Write a quick note..."></textarea>

        <button>Save Note</button>
      </div>
    </aside>
  );
}

export default RightSidebar;