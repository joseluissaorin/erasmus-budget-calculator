# Erasmus Budget Calculator

A comprehensive web application to help Erasmus students plan and manage their study abroad budget. Currently hosted at [erasmus.joseluissaorin.com](https://erasmus.joseluissaorin.com) and at [erasmusbudget.com](https://www.erasmusbudget.com).

![Erasmus Budget Calculator](public/erasmus-budget-preview.gif)

## Features

- 🌍 **City Selection**: Choose from a comprehensive database of European cities
- 🏠 **Accommodation Planning**: Calculate housing costs with options for shared living
- ✈️ **Travel Cost Management**: Track and plan flight expenses
- 📊 **Expense Breakdown**: Detailed visualization of monthly expenses
- 💰 **Scholarship Integration**: Calculate Erasmus+ grant coverage
- 🔄 **Real-time Updates**: Instant calculations and updates
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔗 **Shareable Budgets**: Generate links to share your budget plan with others

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/joseluissaorin/erasmus-budget-calculator.git
   cd erasmus-budget-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **State Management**: React Hooks + Context
- **Data Storage**: IndexedDB for local persistence

## Configuration

### Environment Variables

The application supports the following environment variables:

- `NEXT_PUBLIC_BASE_URL`: (Optional) Override the base URL for shortened links. If not set, the application will automatically detect the domain from the request headers.

You can create a `.env.local` file in the root of the project with these variables, for example:

```
# .env.local example
NEXT_PUBLIC_BASE_URL=https://erasmusbudget.com
```

### Multiple Domain Support

The application supports both domains:
- erasmus.joseluissaorin.com
- erasmusbudget.com

When using the share functionality, the application will automatically detect which domain is being used and generate links with the correct domain. This ensures that shared links always point to the same domain from which they were generated.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by [José Luis Saorín Ferrer](https://github.com/joseluissaorin)

## Acknowledgments

- Thanks to the Erasmus+ Programme for inspiring this project
- All contributors and users who help improve this tool
