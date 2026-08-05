export default function LoadingScreen() {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center">
  
        <div className="text-center animate-pulse">
  
          <h1 className="text-5xl font-black tracking-[0.35em] uppercase">
            <span className="text-white">DOST</span>{" "}
            <span className="text-cyan-400">INDUSTRIES</span>
          </h1>
  
          <p className="mt-4 text-cyan-400 tracking-[0.45em] uppercase text-sm">
            Digital Welding & Engineering Tools
          </p>
  
          <div className="mt-10 flex justify-center">
            <div className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce" />
            <div
              className="mx-2 h-3 w-3 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <div
              className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: "0.30s" }}
            />
          </div>
  
        </div>
  
      </main>
    );
  }