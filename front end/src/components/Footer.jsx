export default function Footer() {
  return (
    <footer className="w-full h-60 bg-gray-50 flex flex-row flex-wrap">
      <div className="h-50 w-1/3 text-blue-600 text-2xl font-bold flex justify-center items-center">
        E7gezly Event
      </div>
      <div className="h-50 w-1/3 text-blue-600 text-l font-bold flex justify-center items-center flex-col">
        <h1 className="w-100 text-xl flex justify-center items-center">
          Follow Us:
        </h1>
        <ul className="w-30 mt-5 ml-5 flex justify-start items-center flex-col">
          <li className="w-full">
            <a href="https://www.instagram.com/soul_studioss/" target="_blank">
              <i className="fa-brands fa-instagram"></i> Instagram
            </a>
          </li>
          <li className="w-full">
            <a href="https://www.facebook.com/george.bahij.9/" target="_blank">
              <i className="fa-brands fa-facebook"></i> Facebook
            </a>
          </li>
          <li className="w-full">
            <a href="https://www.tiktok.com/@soul.studioss" target="_blank">
              <i className="fa-brands fa-tiktok"></i> Tiktok
            </a>
          </li>
          <li className="w-full">
            <a
              href="https://www.youtube.com/watch?v=xvFZjo5PgG0"
              target="_blank"
            >
              <i className="fa-brands fa-youtube"></i> YouTube
            </a>
          </li>
        </ul>
      </div>
      <div className="h-50 w-1/3 text-blue-600 text-2xl font-bold flex justify-center items-center">
        <button className="border-3 px-10 py-3 border-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition duration-300 ease-in-out cursor-pointer">
          Contact Us
        </button>
      </div>
      <span className="w-full h-10 items-center flex justify-center text-gray-400">
        E7gezly Event © Team-3 | No rights reserved
      </span>
    </footer>
  );
}
