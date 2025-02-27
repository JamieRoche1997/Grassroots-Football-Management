import { Tabs, Tab, Box } from "@mui/material";

interface CategoryTabsProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const categories = [
  { label: "All", value: "all" },
  { label: "Memberships", value: "membership" },
  { label: "Merchandise", value: "merchandise" },
  { label: "Training", value: "training" },
  { label: "Match Fees", value: "match" },
  { label: "Other", value: "other" },
];

export default function CategoryTabs({ selectedCategory, setSelectedCategory }: CategoryTabsProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Tabs
        value={selectedCategory}
        onChange={(_, newValue) => setSelectedCategory(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        {categories.map((category) => (
          <Tab key={category.value} label={category.label} value={category.value} />
        ))}
      </Tabs>
    </Box>
  );
}
