import logo from "../img/logo.png"
import profile from "../img/profile.png"
export const Footer = () => {
    const d = new Date();
    let year = d.getFullYear();
    return(
    <>
    <footer className="flex flex-row justify-center items-center p-4 bg-[#0E334D] text-center">
        <p className="text-white text-[14px]">@{year} Suhas Transport. All Rights Reserved</p>
    </footer>
    </>
    )
}