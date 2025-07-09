"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, MoreVertical, Trash2 } from "lucide-react"
import NextImage from "next/image"
import type { Image } from "@/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ImageGalleryProps {
  images: Image[]
  onImageSelect: (image: Image) => void
  onImageDelete: (image: Image) => void
  getImageUrl: (filePath: string) => string
}

export function ImageGallery({ images, onImageSelect, onImageDelete, getImageUrl }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
        <p className="text-gray-500">Upload your first image to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card
          key={image.id}
          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden relative group"
        >
          <CardContent className="p-0">
            <div className="aspect-square relative" onClick={() => onImageSelect(image)}>
              <NextImage src={getImageUrl(image.file_path)} alt={image.name} fill className="object-cover" />

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
                        onImageDelete(image)
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Image
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="p-3" onClick={() => onImageSelect(image)}>
              <h3 className="font-medium text-gray-900 truncate">{image.name}</h3>
              {image.notes && (
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <FileText className="h-3 w-3 mr-1" />
                  Has notes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
