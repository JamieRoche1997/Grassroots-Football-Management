import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, Link } from 'react-router-dom';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  // Split the current path into breadcrumb parts
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      {/* Home link */}
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Typography variant="body1">Home</Typography>
      </Link>

      {/* Dynamically generated breadcrumbs */}
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return isLast ? (
          <Typography
            key={to}
            variant="body1"
            sx={{ color: 'text.primary', fontWeight: 600 }}
          >
            {capitalize(value)}
          </Typography>
        ) : (
          <Link key={to} to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body1">{capitalize(value)}</Typography>
          </Link>
        );
      })}
    </StyledBreadcrumbs>
  );
}

// Helper function to capitalize breadcrumb text
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
