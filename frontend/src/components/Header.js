import { TbGavel } from "react-icons/tb";

function Header() {
  return (
    <div className="flex w-full justify-center h-16">
      <div className="flex flex-row justify-start items-center w-1/2 max-w-xl">
        <TbGavel className="text-4xl"/>
        <div className="m-1 text-2xl">ArgSolve</div>
      </div>
    </div>
  );
}

export default Header;
