import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHuntStore } from "../store/huntStore";
import { useAuthStore } from "../store/authStore";
import { MapPicker } from "../components/MapPicker";
import { generateId } from "../lib/id";
import type { Clue, Difficulty } from "../types";

function emptyClue(): Clue {
  return {
    id: generateId(),
    locationName: "",
    lat: 40.7829,
    lng: -73.9654,
    hint: "",
    verificationDescription: "",
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CreateHunt() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [coverImage, setCoverImage] = useState("");
  const [clues, setClues] = useState<Clue[]>([emptyClue()]);
  const currentUser = useAuthStore((s) => s.currentUser);
  const createHunt = useHuntStore((s) => s.createHunt);
  const navigate = useNavigate();

  function updateClue(index: number, patch: Partial<Clue>) {
    setClues((cs) => cs.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function addClue() {
    setClues((cs) => [...cs, emptyClue()]);
  }

  function removeClue(index: number) {
    setClues((cs) => cs.filter((_, i) => i !== index));
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImage(await fileToDataUrl(file));
  }

  async function handleReferenceChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateClue(index, { referencePhoto: await fileToDataUrl(file) });
  }

  function handleSave(publish: boolean) {
    if (!currentUser) return;
    if (!title.trim() || clues.some((c) => !c.locationName || !c.hint)) {
      alert("Please fill in the hunt title and every clue's location name and hint.");
      return;
    }
    const hunt = createHunt(
      {
        title,
        description,
        difficulty,
        coverImage: coverImage || `https://picsum.photos/seed/${encodeURIComponent(title)}/800/450`,
        clues,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
      },
      publish,
    );
    navigate(`/hunt/${hunt.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/explore" className="text-sm text-neutral-500 dark:text-neutral-400">
        ← Back to Home
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Create a Treasure Hunt</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">
        Design your hunt, pin locations on the map, and share the code with players.
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-sand-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="font-semibold">Hunt Details</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Downtown Discovery Tour"
            className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this hunt about?"
            rows={3}
            className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Cover Image</label>
            <input type="file" accept="image/*" onChange={handleCoverChange} className="w-full text-sm" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-semibold">Clues ({clues.length})</h2>
        <button onClick={addClue} className="text-sm font-medium text-brand-600">
          + Add Clue
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {clues.map((clue, index) => (
          <div
            key={clue.id}
            className="space-y-3 rounded-2xl border border-sand-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Clue #{index + 1}</p>
              {clues.length > 1 && (
                <button onClick={() => removeClue(index)} className="text-xs text-rose-600">
                  Remove
                </button>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Location Name</label>
              <input
                value={clue.locationName}
                onChange={(e) => updateClue(index, { locationName: e.target.value })}
                placeholder="e.g. The Old Clock Tower"
                className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Pin Location on Map</label>
              <MapPicker
                lat={clue.lat}
                lng={clue.lng}
                onChange={(lat, lng) => updateClue(index, { lat, lng })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hint for Players</label>
              <textarea
                value={clue.hint}
                onChange={(e) => updateClue(index, { hint: e.target.value })}
                placeholder="The clue/riddle players will see to guide them to this spot"
                rows={2}
                className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Location Description (for AI verification)
              </label>
              <textarea
                value={clue.verificationDescription}
                onChange={(e) => updateClue(index, { verificationDescription: e.target.value })}
                placeholder="Describe what the surroundings look like — buildings, signs, landmarks, colors, etc. This is used by AI to verify the player's photo."
                rows={2}
                className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Reference Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleReferenceChange(index, e)}
                className="w-full text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => handleSave(false)}
          className="flex-1 rounded-lg border border-sand-300 py-2.5 text-sm font-semibold dark:border-neutral-700"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSave(true)}
          className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Publish Hunt
        </button>
      </div>
    </div>
  );
}
