import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import SitemarkIcon from "./SitemarkIcon";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
      {"Copyright © "}
      <Link
        color="text.secondary"
        href="https://grassroots-football-management.web.app/"
      >
        Grassroots Football Management
      </Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <>
      <Divider />
      <Container
        sx={{
          py: { xs: 6, sm: 8 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { sm: "column", md: "row" },
            alignItems: { xs: "center", sm: "center" },
            justifyContent: "space-between",
            gap: { xs: 4, sm: 2 },
            flexWrap: "wrap",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          {/* Logo */}
          <Link href="/" underline="none" sx={{ textDecoration: "none" }}>
            <SitemarkIcon />
          </Link>

          {/* Product Links */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: { xs: 1, sm: 3 },
            }}
          >
            {["Features", "Pricing", "Reviews", "FAQs", "Contact"].map(
              (text) => (
                <Link
                  key={text}
                  href="#"
                  color="text.secondary"
                  variant="body2"
                  underline="hover"
                  sx={{ "&:hover": { color: "text.primary" } }}
                >
                  {text}
                </Link>
              )
            )}
          </Box>

          {/* Copyright */}
          <Copyright />
        </Box>
      </Container>
    </>
  );
}
