import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryIcon } from '@/lib/categoryIcons';

export function CategoriesPage() {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get('/services/categories')
      .then(({ data }) => setCategories(data.majors || data.categories || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-8 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Service categories</h1>
        <p className="text-muted-foreground">Browse verified professionals by specialty — each category has its own marketplace.</p>
      </motion.div>

      {loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon);
            return (
              <motion.div key={c.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <Link to={`/categories/${c.slug}`}>
                  <Card className="glass h-full border-border/70 transition-shadow hover:shadow-lg">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <motion.div whileHover={{ x: 2 }} className="min-w-0">
                        <CardTitle className="text-lg">{c.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm font-medium text-primary">Explore workers →</span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
