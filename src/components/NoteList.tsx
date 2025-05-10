import React, { useState, useEffect, useCallback } from "react";
import {
  Note,
  createNote,
  submitNote,
  deleteNote,
  editNote,
  refreshNotes,
  getNotes,
} from "../utils/notes";

import NoteForm from "./NoteForm";
import NoteItem from "./NoteItem";
import OfflineIndicator from "./OfflineIndicator";
import { Plus, Tag, XCircle } from "lucide-react";

const colors = [
  "#FFDB79", // yellow
  "#FFA07A", // orange
  "#D9B3FF", // purple
  "#00E5FF", // blue
  "#F0F8A6", // lime
];

const NoteList = () => {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [addNotePopupVisible, setAddNotePopupVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]); // To store unique tags

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      await refreshNotes();
      const notes = await getNotes();
      setAllNotes(notes);

      // Extract unique tags from all notes
      const uniqueTags = new Set<string>();
      notes.forEach((note: Note) => {
        note.tags?.forEach((tag) => uniqueTags.add(tag));
      });
      setAvailableTags(Array.from(uniqueTags));
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNoteSubmit = useCallback(
    async (
      {
        title,
        content,
        tags,
      }: { title: string; content: string; tags: string[] },
      isEdit: boolean,
      noteId?: string,
    ) => {
      setAddNotePopupVisible(false);

      if (isEdit && noteId) {
        await editNote(noteId, title, content, tags);
        // setAllNotes(await getNotes());
      } else {
        const note: Note = createNote(title, content, tags);
        await submitNote(note);
      }
      await fetchNotes(); // Re-fetch notes to update the list
    },
    [fetchNotes]
  );

  const handleNoteDelete = useCallback(
    async (noteId: string) => {
      await deleteNote(noteId);
      await fetchNotes();
    },
    [fetchNotes]
  );

  const handleEditNote = useCallback(async (note: Note) => {
    console.log("handleEditNote", note);
    console.log("allNotes", allNotes);
    // const noteToEdit = allNotes.find((note) => note._id?.toString() === String(noteId));
    setSelectedNote(note);
    setAddNotePopupVisible(true);
    // await editNote(noteId, updatedTitle);
    // setAllNotes(await getNotes());
  }, []);

  useEffect(() => {
    fetchNotes();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { type: "module" })
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Listen for the "online" event to trigger sync
          window.addEventListener("online", async () => {
            registration.sync
              .register("sync-notes")
              .then(() => {
                console.log("Sync event registered");
              })
              .catch((error) => {
                console.error("Sync event registration failed:", error);
              });
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    window.addEventListener("online", async () => {
      await fetchNotes();
    });
  }, [fetchNotes]);

  const addNote = () => {
    setAddNotePopupVisible(true);
    // setSelectedColor(color);
    // setShowColors(false);
    setSelectedNote(undefined); // Clear selected note for adding new
  };

  const filteredNotes =
    selectedTagsFilter.length > 0
      ? allNotes.filter((note) =>
          selectedTagsFilter.some((tag) => note.tags?.includes(tag))
        )
      : allNotes;

  const toggleTagFilter = (tag: string) => {
    setSelectedTagsFilter((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTagsFilter([]);
  };

  // Modal Component (simplified)
  const Modal = ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <XCircle size={24} />
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <aside className="w-20 bg-gray-100 flex flex-col items-center py-4">
        <button
          onClick={() => addNote()}
          className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mb-4"
        >
          <Plus size={20} />
        </button>
        {/* {showColors && (
          <div className="flex flex-col gap-3">
            {colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => addNote(color)}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )} */}
      </aside>
      <main className="flex-1 p-8">
        <div className="flex items-center mb-8 ">
          <h1 className="text-4xl font-bold mr-5">Notes</h1>
          <OfflineIndicator />
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 items-start">
            {availableTags.map((tag) => (
              <div
                key={tag}
                className={`
                  px-4 py-2 rounded-full text-sm cursor-pointer
                  ${
                    selectedTagsFilter.includes(tag)
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                  flex items-center gap-2
                `}
                onClick={() => toggleTagFilter(tag)}
              >
                <Tag className="h-4 w-4" />
                {tag}
                {selectedTagsFilter.includes(tag) && (
                  <XCircle
                    className="h-4 w-4 text-white"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent tag toggle when clicking X
                      toggleTagFilter(tag);
                    }}
                  />
                )}
              </div>
            ))}
            {selectedTagsFilter.length > 0 && (
              <button
                onClick={clearTagFilters}
                className="px-4 py-2 rounded-full text-sm bg-red-500 text-white hover:bg-red-600"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-2 text-gray-500">Loading notes...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteItem
                key={note._id}
                note={note}
                onDeleteNote={handleNoteDelete}
                onEditNote={handleEditNote}
                color={selectedColor}
              />
            ))}
          </div>
        )}
      </main>
      <Modal
        isOpen={addNotePopupVisible}
        onClose={() => setAddNotePopupVisible(false)}
      >
        <NoteForm
          onNoteSubmit={handleNoteSubmit}
          selectedNote={selectedNote}
          onClose={async () => setAddNotePopupVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default NoteList;
