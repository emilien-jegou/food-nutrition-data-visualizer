import { component$ } from '@builder.io/qwik';
import { NutritionTable } from '~/logics/nutrition-table';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <>
      <NutritionTable />
    </>
  );
});

export const head: DocumentHead = {
  title: 'food-nutrition-data-visualizer',
  meta: [
    {
      name: 'description',
      content: "Web visualizer for USDA's non-processed food dataset ",
    },
  ],
};
