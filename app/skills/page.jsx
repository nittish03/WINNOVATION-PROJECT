'use client'
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";

export default function SkillsPage() {
  const { data: session } = useSession();
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadSkills = async () => {
    const { data } = await axios.get("/api/skills");
    setSkills(data);
  };

  useEffect(() => { loadSkills(); }, []);

  const handleAddSkill = async e => {
    e.preventDefault();
    await axios.post("/api/skills", { name, description })
      .then(() => {
        toast.success("Skill added!");
        setName(""); setDescription(""); loadSkills();
      })
      .catch(err => toast.error(err.response?.data?.error || "Error adding skill"));
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Skills</h1>
      {session?.user?.role === "admin" && (
        <form onSubmit={handleAddSkill} className="mb-6 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Skill Name" className="border p-2 rounded w-full" required />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded w-full" />
          <button className="bg-blue-600 text-white py-2 px-4 rounded" type="submit">Add Skill</button>
        </form>
      )}
      <ul className="space-y-2">
        {skills.map(skill => (
          <li key={skill.id} className="p-2 bg-gray-100 rounded">{skill.name}</li>
        ))}
      </ul>
    </div>
  );
}
