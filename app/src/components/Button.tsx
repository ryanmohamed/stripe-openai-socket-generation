import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

const Button = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const handleClick = () => {
    api.connect.createToken.useQuery(user);
  };

  return (
    <>
      <button
        className="bg-blue-300 border-blue-600 border-2 rounded"
        onClick={handleClick}
      >
        Test
      </button>
    </>
  );
};

export default Button;
