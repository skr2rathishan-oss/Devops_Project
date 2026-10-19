import TaskCard from "./TaskCard";

function KanbanBoard() {
  return (
    <section className="kanban-board">
      <div className="kanban-column">
        <div className="column-title">
          <h3>To Do</h3>
          <span>3</span>
        </div>

        <TaskCard
          title="Create Login Page"
          description="Build responsive login and registration interfaces."
          priority="High"
          dueDate="Oct 02"
          assignee="SM"
          subtasks="2 / 5 subtasks"
        />

        <TaskCard
          title="Database Schema"
          description="Design database tables for users, projects and tasks."
          priority="Medium"
          dueDate="Oct 05"
          assignee="AK"
          subtasks="1 / 4 subtasks"
        />

        <button className="column-add">+ Add task</button>
      </div>

      <div className="kanban-column">
        <div className="column-title">
          <h3>In Progress</h3>
          <span>2</span>
        </div>

        <TaskCard
          title="Dashboard UI"
          description="Develop the main task management dashboard."
          priority="High"
          dueDate="Sep 30"
          assignee="SM"
          subtasks="4 / 6 subtasks"
        />

        <TaskCard
          title="REST API"
          description="Create backend endpoints for project tasks."
          priority="Medium"
          dueDate="Oct 03"
          assignee="JD"
          subtasks="3 / 7 subtasks"
        />

        <button className="column-add">+ Add task</button>
      </div>

      <div className="kanban-column">
        <div className="column-title">
          <h3>Review</h3>
          <span>2</span>
        </div>

        <TaskCard
          title="Navigation Component"
          description="Review responsive navigation and sidebar."
          priority="Low"
          dueDate="Sep 29"
          assignee="AK"
          subtasks="4 / 4 subtasks"
        />

        <button className="column-add">+ Add task</button>
      </div>

      <div className="kanban-column">
        <div className="column-title">
          <h3>Done</h3>
          <span>2</span>
        </div>

        <TaskCard
          title="Project Setup"
          description="React and Vite project initialization."
          priority="Low"
          dueDate="Sep 25"
          assignee="SM"
          subtasks="5 / 5 subtasks"
        />

        <TaskCard
          title="Git Repository"
          description="Configure project repository and branches."
          priority="Low"
          dueDate="Sep 26"
          assignee="JD"
          subtasks="3 / 3 subtasks"
        />

        <button className="column-add">+ Add task</button>
      </div>
    </section>
  );
}

export default KanbanBoard;