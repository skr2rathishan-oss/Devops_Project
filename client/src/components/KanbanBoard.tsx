import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "./taskMeta";

type KanbanBoardProps = {
  tasks: Task[];
  canManage: boolean;
  onAdd: (status: TaskStatus) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function KanbanBoard({ tasks, canManage, onAdd, onStatusChange, onEdit, onDelete }: KanbanBoardProps) {
  return (
    <section className="kanban-board">
      {STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <div className="kanban-column" key={status}>
            <div className="column-title">
              <h3>{STATUS_LABELS[status]}</h3>
              <span>{columnTasks.length}</span>
            </div>

            {columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                canManage={canManage}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

            {columnTasks.length === 0 && <p className="column-empty">No tasks</p>}

            <button
              className="column-add"
              onClick={() => onAdd(status)}
              disabled={!canManage}
              title={canManage ? undefined : "Only admins and team leaders can add tasks"}
            >
              + Add task
            </button>
          </div>
        );
      })}
    </section>
  );
}

export default KanbanBoard;
