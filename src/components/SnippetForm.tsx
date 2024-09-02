import { writeTextFile } from "@tauri-apps/api/fs";
import { desktopDir } from "@tauri-apps/api/path";
import { useState } from "react";
import { useSnippetStore } from "../store/SnippetsStore";

function SnippetForm() {

  const [snippetName, setSnippetName] = useState('')
  const addSnippetName = useSnippetStore((state) => state.addSnippetName)

  return (
    <form onSubmit={ async (e) => {
      e.preventDefault();
      const desktopPath = await desktopDir()
      await writeTextFile(`${desktopPath}/tauri/${snippetName}.js`, '')
      setSnippetName('')
      addSnippetName(snippetName+".js")
    }}>
      <input
        type="text"
        placeholder="Enter a title"
        className="bg-zinc-800 w-full border-none p-4"
        onChange={(e) => setSnippetName(e.target.value)}
        value={snippetName}
      />
      <button className="hidden">
        Save
      </button>
    </form>
  );
}

export default SnippetForm;