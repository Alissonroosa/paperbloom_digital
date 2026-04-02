"use client"

import { useEffect, useRef, useCallback } from "react"

interface Petal {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  fallSpeed: number
  swaySpeed: number
  swayAmount: number
  life: number
  maxLife: number
  color: string
}

const COLORS = [
  "rgba(244, 114, 140, ALPHA)", // rosa
  "rgba(255, 182, 193, ALPHA)", // rosa claro
  "rgba(220, 80, 108, ALPHA)",  // rosa escuro
  "rgba(255, 160, 180, ALPHA)", // rosa médio
  "rgba(248, 131, 155, ALPHA)", // rosa quente
]

export function RosePetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const petalsRef = useRef<Petal[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const frameRef = useRef<number>(0)
  const lastSpawnRef = useRef(0)

  const createPetal = useCallback((x: number, y: number): Petal => {
    const colorTemplate = COLORS[Math.floor(Math.random() * COLORS.length)]
    return {
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 20,
      size: 6 + Math.random() * 10,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      opacity: 0.7 + Math.random() * 0.3,
      fallSpeed: 0.5 + Math.random() * 1.5,
      swaySpeed: 0.01 + Math.random() * 0.03,
      swayAmount: 20 + Math.random() * 40,
      life: 0,
      maxLife: 80 + Math.random() * 60,
      color: colorTemplate,
    }
  }, [])

  const drawPetal = useCallback((ctx: CanvasRenderingContext2D, petal: Petal) => {
    const progress = petal.life / petal.maxLife
    const fadeIn = Math.min(progress * 5, 1)
    const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1
    const alpha = petal.opacity * fadeIn * fadeOut

    ctx.save()
    ctx.translate(petal.x, petal.y)
    ctx.rotate(petal.rotation)
    ctx.globalAlpha = alpha

    // Desenha pétala com formato orgânico
    const color = petal.color.replace("ALPHA", String(alpha))
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, -petal.size * 0.5)
    ctx.bezierCurveTo(
      petal.size * 0.5, -petal.size * 0.5,
      petal.size * 0.5, petal.size * 0.3,
      0, petal.size * 0.5
    )
    ctx.bezierCurveTo(
      -petal.size * 0.5, petal.size * 0.3,
      -petal.size * 0.5, -petal.size * 0.5,
      0, -petal.size * 0.5
    )
    ctx.fill()
    ctx.restore()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        active: true,
      }
    }

    const handleTouchEnd = () => {
      mouseRef.current.active = false
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true })
    canvas.addEventListener("touchend", handleTouchEnd)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()
      if (mouseRef.current.active && now - lastSpawnRef.current > 60) {
        const count = 1 + Math.floor(Math.random() * 2)
        for (let i = 0; i < count; i++) {
          petalsRef.current.push(createPetal(mouseRef.current.x, mouseRef.current.y))
        }
        lastSpawnRef.current = now
      }

      // Limita quantidade de pétalas
      if (petalsRef.current.length > 80) {
        petalsRef.current = petalsRef.current.slice(-80)
      }

      petalsRef.current = petalsRef.current.filter((petal) => {
        petal.life++
        petal.y += petal.fallSpeed
        petal.x += Math.sin(petal.life * petal.swaySpeed) * petal.swayAmount * 0.02
        petal.rotation += petal.rotationSpeed

        if (petal.life >= petal.maxLife) return false

        drawPetal(ctx, petal)
        return true
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [createPetal, drawPetal])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-auto"
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
    />
  )
}
