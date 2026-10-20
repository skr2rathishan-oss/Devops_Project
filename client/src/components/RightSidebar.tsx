import { useEffect, useState } from "react";
import type { Task } from "../types";
import { getMyNote, saveMyNote } from "../services/noteService";
import { getAuthErrorMessage } from "../services/authService";
import { STATUS_LABELS, initials, timeAgo } from "./taskMeta";

type RightSidebarProps = {
  tasks: Task[];
  onRefresh: () => void;
};

const ACTIVITY_LIMIT = 5;

// What happened to a task, phrased from its current status (there is no separate activity log).
function describe(task: Task) {
  const isNew = !task.updatedAt || task.updatedAt === task.createdAt;
  if (isNew) return "was added to";
  return task.status === "completed" ? "was moved to" : "is now";
}

function RightSidebar({ tasks, onRefresh }: RightSidebarProps) {
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [noteState, setNoteState] = useState<"loading" | "ready" | "saving" | "error">("loading");
  const [noteMessage, setNoteMessage] = useState("");

  useEffect(() => {
    let active = true;
    getMyNote()
      .then((data) => {
        if (!active) return;
        setNote(data.content);
        setSavedNote(data.content);
        setNoteState("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setNoteState("error");
        setNoteMessage(getAuthErrorMessage(err, "Your note could not be loaded."));
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    setNoteState("saving");
    setNoteMessage("");
    try {
      const saved = await saveMyNote(note);
      setSavedNote(saved.content);
      setNoteMessage("Saved");
    } catch (err) {
      setNoteMessage(getAuthErrorMessage(err, "Could not save your note. Please try again."));
    } finally {
      setNoteState("ready");
    }
  }

  const recent = [...tasks]
    .sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt))
    .slice(0, ACTIVITY_LIMIT);

  return (
    <aside className="right-sidebar">
      <div className="right-title">
        <h3>Team Activity</h3>
        <button onClick={onRefresh} title="Refresh" aria-label="Refresh team activity">•••</button>
      </div>

      {recent.map((task) => (
        <div className="activity" key={task.id}>
          <div className="activity-avatar">{task.assignedToName ? initials(task.assignedToName) : "–"}</div>

          <div>
            <p>
              <strong>{task.assignedToName ?? "Unassigned"}</strong> ·
              <b> {task.title}</b> {describe(task)} {STATUS_LABELS[task.status]}.
            </p>

            <span>{timeAgo(task.updatedAt ?? task.createdAt)}</span>
          </div>
        </div>
      ))}

      {recent.length === 0 && <p className="activity-empty">No activity yet.</p>}

      <div className="notes">
        <h3>Quick Notes</h3>

        <textarea
          placeholder="Write a quick note..."
          aria-label="Quick note"
          value={note}
          maxLength={5000}
          disabled={noteState === "loading" || noteState === "error"}
          onChange={(event) => {
            setNote(event.target.value);
            setNoteMessage("");
          }}
        ></textarea>

        <button
          onClick={() => void handleSave()}
          disabled={noteState !== "ready" || note === savedNote}
        >
          {noteState === "saving" ? "Saving…" : "Save Note"}
        </button>

        {noteMessage && (
          <p className="notes-status" role="status">
            {noteMessage}
          </p>
        )}
      </div>
    </aside>
  );
}

export default RightSidebar;
