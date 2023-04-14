import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
	fonts: {
		body: "Roboto, sans-serif",
		heading: "Roboto, sans-serif",
	},
	components: {
		Table: {
			variants: {
				striped: {
					th: {
						color: "black",
						fontWeight: "normal",
						textTransform: "none",
						fontSize: "18",
						letterSpacing: "0",
					},
				},
			},
		},
		Button: {
			baseStyle: {
				fontWeight: 'normal', // Normally, it is "semibold"
			},
		}
	},
});

export default theme;
