import { VectorFilmCanister } from './VectorFilmCanister';

export default function Demo() {
  return (
    <div className="flex space-x-4 p-8 bg-zinc-900 rounded-xl">
      <div className="flex flex-col items-center">
        <VectorFilmCanister brandColorStart="#facc15" brandColorEnd="#ef4444" textColor="#000" iso="400" className="w-24 h-24 drop-shadow-xl hover:-translate-y-2 transition-transform" />
        <span className="text-white mt-2 text-sm">Kodak Portra</span>
      </div>
      <div className="flex flex-col items-center">
        <VectorFilmCanister brandColorStart="#ccfbf1" brandColorEnd="#5eead4" textColor="#000" iso="400" className="w-24 h-24 drop-shadow-xl hover:-translate-y-2 transition-transform" />
        <span className="text-white mt-2 text-sm">Fuji Pro 400H</span>
      </div>
      <div className="flex flex-col items-center">
        <VectorFilmCanister brandColorStart="#18181b" brandColorEnd="#27272a" textColor="#fff" iso="400" className="w-24 h-24 drop-shadow-xl hover:-translate-y-2 transition-transform" />
        <span className="text-white mt-2 text-sm">Ilford HP5</span>
      </div>
    </div>
  );
}
