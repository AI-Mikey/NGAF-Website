"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { FolderGrid } from "@/components/folder-grid"
import { ImageGallery } from "@/components/image-gallery"
import { ImageDetail } from "@/components/image-detail"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { UploadImageDialog } from "@/components/upload-image-dialog"
import { ArrowLeft, LogOut, Plus, Upload } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { Folder, Image, DatabaseFolder } from "@/types"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [currentView, setCurrentView] = useState<"folders" | "images" | "detail">("folders")
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showUploadImage, setShowUploadImage] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "folder" | "image"
    item: Folder | Image | null
    isDeleting: boolean
  }>({
    open: false,
    type: "folder",
    item: null,
    isDeleting: false,
  })

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    setLoading(true)
    const { data: foldersData, error } = await supabase
      .from("folders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching folders:", error)
      setLoading(false)
      return
    }

    // Get image counts for each folder
    const foldersWithCounts: Folder[] = await Promise.all(
      (foldersData as DatabaseFolder[]).map(async (folder) => {
        const { count } = await supabase
          .from("images")
          .select("*", { count: "exact", head: true })
          .eq("folder_id", folder.id)

        return {
          id: folder.id,
          name: folder.name,
          created_at: folder.created_at,
          imageCount: count || 0,
        }
      }),
    )

    setFolders(foldersWithCounts)
    setLoading(false)
  }

  const fetchImages = async (folderId: string) => {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching images:", error)
      return
    }

    setImages(data || [])
  }

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder)
    setCurrentView("images")
    fetchImages(folder.id)
  }

  const handleImageSelect = (image: Image) => {
    setSelectedImage(image)
    setCurrentView("detail")
  }

  const handleBack = () => {
    if (currentView === "detail") {
      setCurrentView("images")
      setSelectedImage(null)
    } else if (currentView === "images") {
      setCurrentView("folders")
      setSelectedFolder(null)
      setImages([])
    }
  }

  const handleCreateFolder = async (name: string) => {
    const { data, error } = await supabase
      .from("folders")
      .insert([{ name, user_id: user.id }])
      .select()
      .single()

    if (error) {
      console.error("Error creating folder:", error)
      return
    }

    const newFolder = { ...data, imageCount: 0 }
    setFolders([newFolder, ...folders])
    setShowCreateFolder(false)
  }

  const handleFolderDelete = (folder: Folder) => {
    setDeleteDialog({
      open: true,
      type: "folder",
      item: folder,
      isDeleting: false,
    })
  }

  const handleImageDelete = (image: Image) => {
    setDeleteDialog({
      open: true,
      type: "image",
      item: image,
      isDeleting: false,
    })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.item) return

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }))

    try {
      if (deleteDialog.type === "folder") {
        const folder = deleteDialog.item as Folder

        // First, delete all images in the folder from storage
        const { data: folderImages } = await supabase.from("images").select("file_path").eq("folder_id", folder.id)

        if (folderImages && folderImages.length > 0) {
          const filePaths = folderImages.map((img) => img.file_path)
          await supabase.storage.from("images").remove(filePaths)
        }

        // Delete the folder (images will be deleted automatically due to CASCADE)
        const { error } = await supabase.from("folders").delete().eq("id", folder.id)

        if (error) throw error

        // Update local state
        setFolders(folders.filter((f) => f.id !== folder.id))
      } else {
        const image = deleteDialog.item as Image

        // Delete from storage
        const { error: storageError } = await supabase.storage.from("images").remove([image.file_path])

        if (storageError) throw storageError

        // Delete from database
        const { error } = await supabase.from("images").delete().eq("id", image.id)

        if (error) throw error

        // Update local state
        setImages(images.filter((img) => img.id !== image.id))

        // Update folder image count
        if (selectedFolder) {
          setFolders(folders.map((f) => (f.id === selectedFolder.id ? { ...f, imageCount: f.imageCount - 1 } : f)))
        }
      }
    } catch (error) {
      console.error("Error deleting:", error)
    } finally {
      setDeleteDialog({
        open: false,
        type: "folder",
        item: null,
        isDeleting: false,
      })
    }
  }

  const handleUploadImage = async (file: File) => {
    if (!selectedFolder) return

    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${selectedFolder.id}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("images").upload(fileName, file)

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return
    }

    // Save image record to database
    const { data, error } = await supabase
      .from("images")
      .insert([
        {
          name: file.name,
          file_path: fileName,
          folder_id: selectedFolder.id,
          user_id: user.id,
          notes: null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving image record:", error)
      return
    }

    setImages([data, ...images])
    setShowUploadImage(false)

    // Update folder image count
    setFolders(folders.map((f) => (f.id === selectedFolder.id ? { ...f, imageCount: f.imageCount + 1 } : f)))
  }

  const handleUpdateNotes = async (imageId: string, notes: string) => {
    const { error } = await supabase
      .from("images")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", imageId)

    if (error) {
      console.error("Error updating notes:", error)
      return false
    }

    // Update local state
    setImages(images.map((img) => (img.id === imageId ? { ...img, notes } : img)))
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage({ ...selectedImage, notes })
    }

    return true
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage.from("images").getPublicUrl(filePath)
    return data.publicUrl
  }

  if (loading && currentView === "folders") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your folders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentView !== "folders" && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentView === "folders"
                  ? "Visual Notes"
                  : currentView === "images"
                    ? selectedFolder?.name
                    : selectedImage?.name}
              </h1>
              {currentView === "images" && (
                <p className="text-sm text-gray-500">
                  {images.length} {images.length === 1 ? "image" : "images"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentView === "folders" && (
              <Button onClick={() => setShowCreateFolder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            )}
            {currentView === "images" && (
              <Button onClick={() => setShowUploadImage(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {currentView === "folders" && (
          <FolderGrid folders={folders} onFolderSelect={handleFolderSelect} onFolderDelete={handleFolderDelete} />
        )}
        {currentView === "images" && (
          <ImageGallery
            images={images}
            onImageSelect={handleImageSelect}
            onImageDelete={handleImageDelete}
            getImageUrl={getImageUrl}
          />
        )}
        {currentView === "detail" && selectedImage && (
          <ImageDetail image={selectedImage} onUpdateNotes={handleUpdateNotes} getImageUrl={getImageUrl} />
        )}
      </main>

      {/* Dialogs */}
      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onCreateFolder={handleCreateFolder}
      />
      <UploadImageDialog open={showUploadImage} onOpenChange={setShowUploadImage} onUploadImage={handleUploadImage} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDelete}
        title={deleteDialog.type === "folder" ? "Delete Folder" : "Delete Image"}
        description={
          deleteDialog.type === "folder"
            ? `Are you sure you want to delete "${(deleteDialog.item as Folder)?.name}"? This will permanently delete the folder and all images inside it. This action cannot be undone.`
            : `Are you sure you want to delete "${(deleteDialog.item as Image)?.name}"? This action cannot be undone.`
        }
        isDeleting={deleteDialog.isDeleting}
      />
    </div>
  )
}
