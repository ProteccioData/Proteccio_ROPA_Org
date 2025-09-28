import logo from "../../assets/logo.svg";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logo}
        alt="Proteccio Logo"
        className="w-28 sm:w-32 md:w-40"
      />
    </div>
  );
}
