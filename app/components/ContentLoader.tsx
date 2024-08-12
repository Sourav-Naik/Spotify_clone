export default function ContentLoader() {
  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="relative w-full h-full flex">
        <div className="absolute top-0 left-0 w-[200%] h-full flex animate-translate-x">
          <div className="w-1/2 h-full bg-gradient-to-r from-[#121212] via-[#3e3e3e] to-[#121212]" />
          <div className="w-1/2 h-full bg-gradient-to-r from-[#121212] via-[#3e3e3e] to-[#121212]" />
        </div>
      </div>
    </div>
  );
}
