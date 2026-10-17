import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FLOORS, WALLS } from './materials.js'

// 바닥·벽 재질을 고르면 바로 바뀌는 3D 거실. 외부 모델 파일 없이 상자·원기둥으로만 만든다.
function floorTexture(f) {
  const c = document.createElement('canvas'); c.width = c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = f.base; g.fillRect(0, 0, 512, 512)
  if (f.tile) {
    g.strokeStyle = f.grain; g.lineWidth = 3
    for (let i = 0; i <= 512; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke() }
  } else {
    for (let r = 0; r < 8; r++) {
      const y = r * 64, off = (r % 2) * 180
      g.strokeStyle = f.grain; g.globalAlpha = 0.6; g.lineWidth = 2
      g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke()
      g.beginPath(); g.moveTo(off + 120, y); g.lineTo(off + 120, y + 64); g.stroke()
      g.globalAlpha = 0.18
      for (let k = 0; k < 6; k++) { g.beginPath(); const yy = y + 8 + k * 9 + Math.sin(k + r) * 3; g.moveTo(0, yy); g.bezierCurveTo(170, yy + 4, 340, yy - 4, 512, yy + 2); g.stroke() }
      g.globalAlpha = 1
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace
  return t
}

export default function Room3D({ floor, wall }) {
  const box = useRef(null)
  const api = useRef({})

  useEffect(() => {
    const el = box.current
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#efe9df')
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(6.2, 4.2, 7.4)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 5; controls.maxDistance = 13
    controls.minPolarAngle = 0.5; controls.maxPolarAngle = 1.35
    controls.minAzimuthAngle = -0.2; controls.maxAzimuthAngle = 1.75
    controls.autoRotate = true; controls.autoRotateSpeed = 0.6
    controls.addEventListener('start', () => { controls.autoRotate = false })

    scene.add(new THREE.HemisphereLight('#fff6e8', '#b9a58c', 0.9))
    const sun = new THREE.DirectionalLight('#ffe2b8', 2.4)
    sun.position.set(-3, 6, -6); sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -6; sun.shadow.camera.right = 6; sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6
    scene.add(sun)

    const W = 8, D = 6, H = 2.7
    const mat = (c, r = 0.85) => new THREE.MeshStandardMaterial({ color: c, roughness: r })
    const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.6 })
    const wallMat = mat('#e9e1d3', 0.95)
    const add = (geo, m, x, y, z, cast = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; scene.add(o); return o }

    add(new THREE.BoxGeometry(W, 0.1, D), floorMat, 0, -0.05, 0, false)
    // 뒷벽(창 구멍) — 창 양옆·위아래 4장으로
    const wz = -D / 2
    add(new THREE.BoxGeometry(2.2, H, 0.12), wallMat, -W / 2 + 1.1, H / 2, wz)
    add(new THREE.BoxGeometry(2.2, H, 0.12), wallMat, W / 2 - 1.1, H / 2, wz)
    add(new THREE.BoxGeometry(3.6, 0.5, 0.12), wallMat, 0, 0.25, wz)
    add(new THREE.BoxGeometry(3.6, 0.35, 0.12), wallMat, 0, H - 0.175, wz)
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.85), new THREE.MeshBasicMaterial({ color: '#f7e7c8' }))
    glass.position.set(0, 1.425, wz - 0.03); scene.add(glass)
    add(new THREE.BoxGeometry(0.06, 1.85, 0.14), mat('#d9cdb8'), 0, 1.425, wz)
    // 왼쪽 벽
    add(new THREE.BoxGeometry(0.12, H, D), wallMat, -W / 2, H / 2, 0)

    // 커튼
    const curtain = new THREE.MeshStandardMaterial({ color: '#fbf6ec', roughness: 1, transparent: true, opacity: 0.85 })
    add(new THREE.BoxGeometry(0.5, 2.25, 0.08), curtain, -2.05, 1.2, wz + 0.2)
    add(new THREE.BoxGeometry(0.5, 2.25, 0.08), curtain, 2.05, 1.2, wz + 0.2)

    // 러그·소파·테이블·수납장·화분
    add(new THREE.BoxGeometry(3.4, 0.02, 2.3), mat('#e3d6c1', 1), 0.3, 0.01, 0.3, false)
    const sofa = mat('#e8dccb', 1)
    add(new THREE.BoxGeometry(3, 0.42, 1), sofa, 0.3, 0.25, 1.75)
    add(new THREE.BoxGeometry(3, 0.55, 0.28), sofa, 0.3, 0.6, 2.15)
    add(new THREE.BoxGeometry(0.28, 0.5, 1), sofa, -1.06, 0.45, 1.75)
    add(new THREE.BoxGeometry(0.28, 0.5, 1), sofa, 1.66, 0.45, 1.75)
    const cushion = mat('#cdb99c', 1)
    add(new THREE.BoxGeometry(0.5, 0.42, 0.14), cushion, -0.5, 0.72, 1.96)
    add(new THREE.BoxGeometry(0.5, 0.42, 0.14), cushion, 1.1, 0.72, 1.96)
    const stone = mat('#ddd3c4', 0.7)
    add(new THREE.CylinderGeometry(0.6, 0.6, 0.32, 40), stone, 0.3, 0.16, 0.2)
    const oak = mat('#b88b5c', 0.6)
    add(new THREE.BoxGeometry(0.45, 0.5, 3.2), oak, -W / 2 + 0.3, 0.25, 0.2)
    add(new THREE.CylinderGeometry(0.18, 0.14, 0.4, 24), mat('#cfc4b4'), -W / 2 + 0.5, 0.2, -2.3)
    const leaf = mat('#7d8f5f', 0.9)
    ;[[0, 1.0, 0], [0.18, 0.85, 0.1], [-0.15, 0.9, -0.08], [0.05, 1.15, -0.12]].forEach(([x, y, z]) => add(new THREE.SphereGeometry(0.26, 16, 12), leaf, -W / 2 + 0.5 + x, y, -2.3 + z))
    add(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 6), mat('#6b5236'), -W / 2 + 0.5, 0.6, -2.3)
    // 펜던트 조명
    add(new THREE.CylinderGeometry(0.01, 0.01, 0.9, 6), mat('#333'), 2.6, H - 0.45, 0.2, false)
    const lampM = new THREE.MeshStandardMaterial({ color: '#f2e6d3', emissive: '#ffcf8a', emissiveIntensity: 0.6 })
    add(new THREE.SphereGeometry(0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), lampM, 2.6, H - 0.95, 0.2, false)
    const bulb = new THREE.PointLight('#ffcf8a', 3, 5); bulb.position.set(2.6, H - 1.05, 0.2); scene.add(bulb)

    api.current = { floorMat, wallMat }

    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
    let raf, visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    const loop = () => { raf = requestAnimationFrame(loop); if (!visible) return; controls.update(); renderer.render(scene, camera) }
    loop()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose(); renderer.dispose(); el.removeChild(renderer.domElement) }
  }, [])

  useEffect(() => {
    const { floorMat } = api.current
    if (!floorMat) return
    floorMat.map?.dispose()
    floorMat.map = floorTexture(FLOORS.find((f) => f.id === floor))
    floorMat.needsUpdate = true
  }, [floor])

  useEffect(() => {
    const { wallMat } = api.current
    if (wallMat) wallMat.color.set(WALLS.find((w) => w.id === wall).color)
  }, [wall])

  return <div className="room3d" ref={box} />
}
