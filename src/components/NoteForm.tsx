import React, { useState, useEffect, ChangeEvent } from "react";
import { LoadingSpinner } from "./LoadingSpinner"; // Assuming this exists
import { Note } from "@/utils/notes";

interface Tag {
  id: number;
  tagname: string;
}

const NoteForm: React.FC<NoteFormProps> = ({
  onNoteSubmit,
  selectedNote,
  onClose
}) => {
  const [isSyncing, setSyncing] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true); // Track loading state
  const [tagsError, setTagsError] = useState<string | null>(null); // Track errors
const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await fetch("/api/tags"); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.status}`);
        }
        const data: Tag[] = await response.json();
        setAvailableTags(data);
        setFilteredTags(data); // Initialize filtered tags
      } catch (error: any) {
        setTagsError(error.message);
      } finally {
        setLoadingTags(false);
      }
    };
    if (selectedNote) {
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content || "");
      setSelectedTags(selectedNote.tags || []);
    }
    fetchTags();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNoteTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(event.target.value);
  };

  const handleNoteContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(event.target.value);
  };

  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTagInput(value);
    if (value.trim() !== "") {
      setFilteredTags(
        availableTags.filter((tag) =>
          tag.tagname.toLowerCase().includes(value.toLowerCase())
        )
      );
      setShowDropdown(true);
    } else {
      setFilteredTags(availableTags);
      setShowDropdown(false);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    if (!selectedTags.includes(tag.tagname)) {
      setSelectedTags([...selectedTags, tag.tagname]);
    }
    setTagInput("");
    setShowDropdown(false);
    setFilteredTags(availableTags);
  };

  const handleAddCustomTag = async () => {
    // Make this async to potentially add to DB
    const newTag = tagInput.trim();
    if (
      newTag !== "" &&
      !availableTags.some(
        (t) => t.tagname.toLowerCase() === newTag.toLowerCase()
      ) &&
      !selectedTags.includes(newTag)
    ) {
      //Optimistically update
      setSelectedTags([...selectedTags, newTag]);
      setTagInput("");
      setShowDropdown(false);
      setFilteredTags(availableTags);

      //Ideally you would add the tag to the database here
      try {
        const response = await fetch("/api/add-tags", {
          // Replace with your actual API endpoint
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tagname: newTag }),
        });
        if (!response.ok) {
          throw new Error("Failed to add new tag");
        }
        const newTagData: Tag = await response.json();
        setAvailableTags((prevTags) => [...prevTags, newTagData]);
      } catch (error) {
        //Handle error
        setSelectedTags((prevTags) => prevTags.filter((tag) => tag !== newTag)); //Remove optimistically added tag
        console.error("Failed to add tag to database", error);
      }
    }
    setTagInput("");
    setShowDropdown(false);
    setFilteredTags(availableTags);
  };

  const handleRemoveSelectedTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      noteTitle.trim() === "" &&
      noteContent.trim() === "" &&
      selectedTags.length === 0
    ) {
      return;
    }
    setSyncing(true);
    await onNoteSubmit({
      title: noteTitle,
      content: noteContent,
      tags: selectedTags,
    }, selectedNote ? true : false, selectedNote?.localId || "");
    setSyncing(false);
    setNoteTitle("");
    setNoteContent("");
    setSelectedTags([]);
    setTagInput("");
  };

  if (loadingTags) {
    return (
      <div className="flex items-center justify-center h-24">
        <LoadingSpinner />
        <span className="ml-2 text-gray-500">Loading tags...</span>
      </div>
    );
  }

  if (tagsError) {
    return <div className="text-red-500">Error loading tags: {tagsError}</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col self-center w-full max-w-lg bg-white p-6 space-y-4"
    >
      <div>
        <label
          htmlFor="noteTitle"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Title
        </label>
        <input
          type="text"
          id="noteTitle"
          value={noteTitle}
          onChange={handleNoteTitleChange}
          placeholder="Enter note title"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div>
        <label
          htmlFor="noteContent"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Content
        </label>
        <textarea
          id="noteContent"
          rows={4}
          value={noteContent}
          onChange={handleNoteContentChange}
          placeholder="Enter your note content..."
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div>
        <label
          htmlFor="noteTags"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Tags
        </label>
        <div className="relative">
          <input
            type="text"
            id="noteTags"
            value={tagInput}
            onChange={handleTagInputChange}
            placeholder="Search or add tags"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            onFocus={() =>
              setShowDropdown(tagInput.trim() !== "" && filteredTags.length > 0 && isOnline)
            }
            disabled={!isOnline}
          />
          {showDropdown && isOnline && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-y-auto">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => handleSelectTag(tag)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {tag.tagname}
                </div>
              ))}
              {tagInput.trim() !== "" &&
                !availableTags.some(
                  (t) => t.tagname.toLowerCase() === tagInput.toLowerCase()
                ) &&
                !selectedTags.includes(tagInput.trim()) && (
                  <div
                    onClick={handleAddCustomTag}
                    className="px-4 py-2 text-indigo-500 hover:bg-indigo-100 cursor-pointer"
                  >
                    Add &quot;{tagInput.trim()}&quot;
                  </div>
                )}
              {filteredTags.length === 0 &&
                tagInput.trim() !== "" &&
                !availableTags.some(
                  (t) => t.tagname.toLowerCase() === tagInput.toLowerCase()
                ) &&
                !selectedTags.includes(tagInput.trim()) && (
                  <div className="px-4 py-2 text-gray-500">
                    No matching tags
                  </div>
                )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold px-2 py-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveSelectedTag(tag)}
                className="ml-1 text-indigo-500 hover:text-indigo-700 focus:outline-none"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className={`bg-[#FFDB79] hover:bg-[#fad161] text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isSyncing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSyncing}
        >
          {isSyncing ? <LoadingSpinner /> : (selectedNote ? 'Edit Note' : 'Add Note')}
        </button>
      </div>
    </form>
  );
};

interface NoteFormProps {
  onNoteSubmit: (noteData: {
    title: string;
    content: string;
    tags: string[];
  },isEdit: boolean, id: string) => Promise<void>;
  selectedNote?: Note;
  onClose: () => Promise<void>;
}

export default NoteForm;
