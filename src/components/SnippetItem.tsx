import { twMerge } from 'tailwind-merge';
import { useSnippetStore } from '../store/SnippetsStore'
import { readTextFile, removeFile } from '@tauri-apps/api/fs';
import { desktopDir, join } from "@tauri-apps/api/path"
import { toast } from 'react-toastify';
import { FaTrash, FaRegTimesCircle } from 'react-icons/fa';

interface SnippetItemProps {
  file: string;
}

function SnippetItem({ file }: SnippetItemProps) {

  const setSelectedSnippet = useSnippetStore((state) => state.setSelectedSnippet)
  const selectdSnippet = useSnippetStore((state) => state.selectedSnippet)
  const removeSnippetName = useSnippetStore((state) => state.removeSnippetName)

  const handleDelete = async (file: string) => {

    const confirmar = await window.confirm("Are you sure you want to delete this file?")
    if (!confirmar) return

    const desktopPath = await desktopDir();
    const filePath = await join(desktopPath, 'tauri', file);
    await removeFile(filePath);
    removeSnippetName(file)
    toast.success(`Se elimino archivo ${file}!`, {
      position: "bottom-right",
      theme: "dark"
    });
  }

  const handleCancel = () => {
    setSelectedSnippet(null)
  }

  return (
    <div
      className={twMerge("py-2 px-4 hover:bg-neutral-500 hover:cursor-pointer flex justify-between", selectdSnippet?.name === file ? "bg-neutral-500" : "")}
      onClick={ async() => {
        const desktopPath = await desktopDir();
        const ruta = await join(desktopPath, 'tauri', file);
        const contents = await readTextFile(ruta);
        setSelectedSnippet( { name: file, code: contents } )
      }}
    >
      <h1>{file}</h1>
      <div className="flex gap-2">
        <FaTrash
          onClick={(e) => {
            e.stopPropagation()
            // alert("Delete: "+file)
            handleDelete(file)
          }}
          className='text-neutral-500 hover:text-red-500'
        />
        <FaRegTimesCircle
          onClick={(e) => {
            e.stopPropagation()
            handleCancel()
          }}
          className='text-neutral-500 hover:text-red-500'
        />
      </div>
    </div>
  )
}

export default SnippetItem