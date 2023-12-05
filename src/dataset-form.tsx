import { memo, useEffect, useState } from "react";
import { FieldType, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { FIELDS, getFieldValuesByRecords } from "./fields-meta";

export const DatasetForm = memo(({ onSubmit, bitable }: { onSubmit: Function; bitable: any }) => {
	const translation = useTranslation();
	const callback = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<"translation", undefined>) => {
		uiBuilder.form(
			form => ({
				formItems: [
					form.tableSelect("table", { label: "选择数据表" }),
					form.select("chartType", {
						label: "图表类型",
						options: [
							{ label: "柱状图", value: "bar" },
							{ label: "折线图", value: "line" },
							{ label: "散点图", value: "scatter" },
						],
						defaultValue: "bar",
					}),
				],
				buttons: ["确定"],
			}),
			async ({ key, values }: any) => {
				if (!values.table) {
					uiBuilder.message.error("请选择数据表");
					return;
				}
				onSubmit([key, values]);
			}
		);
	};

	useEffect(() => {
		const container: HTMLElement = document.querySelector("#container") as HTMLElement;
		const uiBuilder = new UIBuilder(container, {
			bitable,
			callback,
			translation,
		});
		return () => {
			uiBuilder.unmount();
		};
	}, [translation]);

	return <div id="container"></div>;
});

export const datasetFormSubmit = async (formData: any, setOption: Function) => {
	const [key, { table, chartType }] = formData;
	let records = await table.getRecords();
	console.log(records);

	// setOption({
	// 	toolbox: {
	// 		show: true,
	// 		feature: {
	// 			magicType: {
	// 				type: ["line", "bar"],
	// 			},
	// 			restore: {},
	// 			saveAsImage: { pixelRatio: 2, name: yAxisNames.join("-") },
	// 		},
	// 	},
	// 	tooltip: {
	// 		trigger: "axis",
	// 		axisPointer: {
	// 			type: "shadow",
	// 		},
	// 	},
	// 	legend: {},
	// 	xAxis: {
	// 		data: xAxisRecords,
	// 		axisPointer: {
	// 			show: true,
	// 		},
	// 	},
	// 	yAxis: yAxisRecords.map((record, i) => {
	// 		return { name: yAxisNames[i], axisLine: { show: true }, offset: Math.max(40 * (i - 1), 0), alignTicks: true };
	// 	}),
	// 	series: yAxisRecords.map((record, i) => {
	// 		return { name: yAxisNames[i], type: chartType, data: record, yAxisIndex: i };
	// 	}),
	// });
};
