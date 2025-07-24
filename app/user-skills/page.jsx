'use client'
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-toastify";

export default function UserSkillsPage() {
  const { data: session } = useSession();
  const [userSkills, setUserSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillId, setSkillId] = useState("");
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (!session) return;
    axios.get("/api/user-skills").then(r => setUserSkills(r.data));
    axios.get("/api/skills").then(r => setSkills(r.data));
  }, [session]);

  async function addUserSkill(e) {
    e.preventDefault();
    await axios.post("/api/user-skills", { skillId, level });
    toast.success("Skill Level updated!");
    setSkillId(""); setLevel(1);
    axios.get("/api/user-skills").then(r => setUserSkills(r.data));
  }

  if (session?.user?.role !== "student") return <div>Not allowed.</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">My Skill Levels</h1>
      <form onSubmit={addUserSkill} className="mb-6 space-y-2">
        <select className="border p-2 rounded w-full" value={skillId} onChange={e => setSkillId(e.target.value)} required>
          <option value="">Select Skill</option>
          {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
        </select>
        <input className="border p-2 rounded w-full" type="number" min={1} max={10} value={level}
               onChange={e => setLevel(Number(e.target.value))} placeholder="Level (1-10)" required />
        <button className="bg-blue-600 text-white py-2 px-4 rounded" type="submit">Set Level</button>
      </form>
      <ul className="space-y-2">
        {userSkills.map(us => (
          <li key={us.id} className="p-2 bg-gray-100 rounded">{us.skill.name}: Level {us.level}</li>
        ))}
      </ul>
    </div>
  );
}
