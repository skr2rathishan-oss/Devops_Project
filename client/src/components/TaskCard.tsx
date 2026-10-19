type TaskCardProps = {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  assignee: string;
  subtasks?: string;
};

function TaskCard({
  title,
  description,
  priority,
  dueDate,
  assignee,
  subtasks,
}: TaskCardProps) {
  return (
    <div className="task-card">
      <div className="task-top">
        <span className={`priority ${priority.toLowerCase()}`}>
          {priority}
        </span>

        <button>•••</button>
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {subtasks && (
        <div className="subtask">
          <span>☑</span>
          {subtasks}
        </div>
      )}

      <div className="task-bottom">
        <div className="task-user">{assignee}</div>

        <span>📅 {dueDate}</span>
      </div>
    </div>
  );
}

export default TaskCard;