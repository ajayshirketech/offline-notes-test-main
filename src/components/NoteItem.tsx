import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import SyncIndicator from "./SyncIndicator";
import { Note } from "../utils/notes";
import { Button } from "../styles/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { Plus, Star, Pencil, DeleteIcon, Delete, Trash2 } from "lucide-react";

interface NoteItemProps {
  note: Note;
  onDeleteNote: (noteId: string) => Promise<void>;
  onEditNote: (note: Note) => Promise<void>;
  color: string;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onDeleteNote,
  onEditNote,
}) => {
  // console.log("NoteItem", note);
  const [isSyncing, setSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDelete = async () => {
    // Set syncing state to true before making the request
    setSyncing(true);

    try {
      // Make the delete request to the server
      if (note.localId !== undefined) {
        await onDeleteNote(note.localId);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      // Set syncing state back to false after the request is complete
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.value = note.title;
    }
  }, [isEditing, note.title]);

  return (
    <div
      key={note._id}
      className="rounded-xl p-4 text-black relative flex flex-col justify-between bg-yellow-100 shadow-md hover:shadow-lg transition-shadow duration-200"
      style={{ backgroundColor: "#FFDB79" }}
    >
      {(note.localDeleteSynced === false ||
        !note.localEditSynced === false ||
        note._id === undefined) && (
        <div className="mt-2 text-xs text-red-600 flex flex-col gap-1">
          {note.localDeleteSynced === false && (
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faExclamationCircle} /> Note deletion not
              synced
            </div>
          )}
          {note.localEditSynced === false && (
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faExclamationCircle} /> Note edit not
              synced
            </div>
          )}
          {note._id === undefined && (
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faExclamationCircle} /> Note submission not
              synced
            </div>
          )}
        </div>
      )}
      <div className="text-gray-800 font-bold mt-2 text-xl">
        <p>{note.title}</p>
      </div>
      <p
        className="mt-1 text-gray-700"
        style={{ whiteSpace: "pre-line", lineHeight: "normal" }}
      >
        {note.content}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {note.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-end mt-4">
        <p className="text-gray-600 text-sm">
          {new Date(note.createdAt).toLocaleString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex items-end gap-2">
          <button
            className="rounded-full bg-black text-white p-2 hover:bg-gray-700 transition-colors"
            onClick={() => {
              if (note._id !== undefined) {
                onEditNote(note);
              }
            }}
          >
            <Pencil size={16} />
          </button>
          <button
            className="rounded-full bg-black text-white p-2 hover:bg-red-700 transition-colors"
            onClick={() => handleDelete()}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default NoteItem;
