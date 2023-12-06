import * as echarts from "echarts";

export const _echarts: any = echarts;
export const themes = [
	{
		key: "chalk",
		label: "Chalk",
	},
	{
		key: "essos",
		label: "Essos",
	},
	{
		key: "westeros",
		label: "Westeros",
	},
	{
		key: "infographic",
		label: "Infographic",
	},
	{
		key: "macarons",
		label: "Macarons",
	},
	{
		key: "purple-passion",
		label: "Purple Passion",
	},
	{
		key: "roma",
		label: "Roma",
	},
	{
		key: "shine",
		label: "Shine",
	},
	{
		key: "vintage",
		label: "Vintage",
	},
	{
		key: "walden",
		label: "Walden",
	},
	{
		key: "wonderland",
		label: "Wonderland",
	},
];

themes.forEach((theme: any) => {
	if (!theme.registered) {
		delete theme.registered;
		fetch(`theme/${theme.key}.json`)
			.then(r => r.json())
			.then(themeJson => {
				_echarts.registerTheme(theme.key, themeJson);
			});
	}
});

themes.unshift(
	{
		key: "default",
		label: "默认",
	},
	{
		key: "dark",
		label: "暗黑",
	}
);
