import { useEffect, useState } from "react"

function Loader() {
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  }, [])
  return (
    loader && <div className="min-h-[100vh] min-w-[100vw] flex flex-col justify-center items-center fixed z-10" style={{ backdropFilter: "blur(3px)" }}>
      <img src="/bazaar.gif" className="w-auto h-auto" alt="TJ Bazaar" />
    </div>
  )
}

export default Loader;