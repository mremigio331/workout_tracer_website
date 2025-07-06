import React from "react";
import { Card, Typography, Spin, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import useGetPublicUsers from "../../hooks/useGetPublicUsers";

const { Link, Text } = Typography;

const PublicUsers = () => {
  const navigate = useNavigate();
  const { allUserProfiles, isAllUserFetching, isAllUserError } =
    useGetPublicUsers();

  // Sort alphabetically by name
  const sortedProfiles = Array.isArray(allUserProfiles)
    ? [...allUserProfiles].sort((a, b) =>
        (a.name || "").localeCompare(b.name || ""),
      )
    : [];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, textAlign: "left", marginBottom: 32 }}>
        Public Profiles
      </h1>
      {isAllUserFetching ? (
        <Spin size="large" />
      ) : isAllUserError ? (
        <div>Error loading public profiles.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sortedProfiles.map((profile) => (
            <Card
              key={profile.user_id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: 16,
                minHeight: 100,
              }}
              bodyStyle={{ display: "flex", alignItems: "center", padding: 0 }}
            >
              <Avatar
                src={profile.profile_medium || profile.profile}
                size={64}
                style={{ marginRight: 24, flexShrink: 0 }}
              >
                {profile.firstname
                  ? profile.firstname[0]
                  : profile.name
                    ? profile.name[0]
                    : "?"}
              </Avatar>
              <div style={{ flex: 1 }}>
                <div>
                  <Link
                    style={{ fontSize: 20, fontWeight: 600 }}
                    onClick={() => navigate(`/users/${profile.strava_id}`)}
                  >
                    {profile.name}
                  </Link>
                </div>
                <div>
                  <Text type="secondary">
                    {profile.firstname || ""} {profile.lastname || ""}
                  </Text>
                </div>
                {profile.city && (
                  <div>
                    <Text type="secondary">{profile.city}</Text>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicUsers;
