"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EditorPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to the new editor location
        router.replace('/editor/mensagem')
    }, [router])

    return null
}

