"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import NextImage from "next/image"
import type { Image } from "@/types"

interface ImageDetailProps {
  image: Image
  onUpdateNotes: (imageId: string, notes: string) => void
  getImageUrl: (filePath: string) => string
}

export function ImageDetail({ image, onUpdateNotes, getImageUrl }: ImageDetailProps) {
  const [notes, setNotes] = useState(image.notes || "")
  const [saving, setSaving] = useState(false)

  const handleSaveNotes = async () => {
    setSaving(true)

    try {
      await onUpdateNotes(image.id, notes)
    } catch (error) {
      console.error("Failed to save notes:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      {/* Image Panel */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-square relative">
            <NextImage
              src={getImageUrl(image.file_path)}
              alt={image.name}
              fill
              className="object-contain bg-gray-50"
              onError={(e) => {
                console.error("Failed to load image:", image.file_path)
                console.error("Image URL:", getImageUrl(image.file_path))
                // Set a fallback image
                e.currentTarget.src = "/placeholder.svg?height=400&width=400"
              }}
              onLoad={() => {
                console.log("Image loaded successfully:", image.file_path)
              }}
              unoptimized={true}
              priority={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notes</span>
            <Button onClick={handleSaveNotes} disabled={saving || notes === image.notes} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{image.name}</h3>
            </div>
            <Textarea
              placeholder="Add your notes, observations, or documentation here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[400px] resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
