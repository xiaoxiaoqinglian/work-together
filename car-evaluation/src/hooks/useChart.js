import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js'

// Chart.js 实例生命周期：deps 变化时销毁重建
export function useChart(factory, deps) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return undefined
    chartRef.current = factory(canvasRef.current.getContext('2d'))
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return canvasRef
}
