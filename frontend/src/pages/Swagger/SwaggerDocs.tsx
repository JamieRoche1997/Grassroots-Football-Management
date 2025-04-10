import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "../../services/getAuthHeaders";

export default function SwaggerDocs() {
  const [headers, setHeaders] = useState<HeadersInit | null>(null);

  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        const authHeaders = await getAuthHeaders();
        console.log("Fetched Headers:", authHeaders);
        setHeaders(authHeaders);
      } catch (error) {
        console.error("Error fetching auth headers:", error);
      }
    };

    fetchHeaders();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Only render SwaggerUI if headers are ready */}
      {headers ? (
        <SwaggerUI
          url="/openapi.yaml"
          requestInterceptor={(req) => {
            req.headers = {
              ...req.headers,
              ...headers, // inject your auth headers dynamically here
            };
            return req;
          }}
        />
      ) : (
        <p>Loading API documentation...</p>
      )}
    </div>
  );
}
