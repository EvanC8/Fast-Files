import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import DownloadPage from './pages/DownloadPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/download" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  )
}
