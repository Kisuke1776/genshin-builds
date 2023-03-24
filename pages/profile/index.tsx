import Link from "next/link";
import { useState } from "react";

function ProfileIndex() {
  const [uuid, setUuid] = useState<string>("");
  const [favoritesProfile, setFavoritesProfile] = useState<string[]>([]);

  const onSubmit = () => {
    setFavoritesProfile([...favoritesProfile, uuid]);
    // TODO: add api call /api/submit_uuid
    fetch("/api/submit_uuid?uid="+uuid, {
      method: "POST",
    });
  };

  return (
    <div>
      <div>
        {favoritesProfile.map((profile) => (
          <Link key={profile} href={`/profile/${profile}`}>
            {profile}
          </Link>
        ))}
      </div>
      <div>
        <input
          placeholder="Your UUID"
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
        />
        <button onClick={() => onSubmit()}>submit</button>
      </div>
    </div>
  );
}

export default ProfileIndex;
