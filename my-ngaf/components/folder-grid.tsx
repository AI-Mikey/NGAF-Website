"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FolderIcon, ImageIcon, MoreVertical, Trash2 } from "lucide-react"
import type { Folder } from "@/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FolderGridProps {
  folders: Folder[]
  onFolderSelect: (folder: Folder) => void
  onFolderDelete: (folder: Folder) => void
}

export function FolderGrid({ folders, onFolderSelect, onFolderDelete }: FolderGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {folders.map((folder) => (
        <Card key={folder.id} className="cursor-pointer hover:shadow-md transition-shadow relative group">
          <CardContent className="p-6 text-center" onClick={() => onFolderSelect(folder)}>
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{folder.name}</h3>
                <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {folder.imageCount} {folder.imageCount === 1 ? "image" : "images"}
                </p>
              </div>
            </div>
          </CardContent>

          {/* Delete button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onFolderDelete(folder)
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  )
}
