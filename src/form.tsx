import { memo, useEffect, useState } from "react";
import { FieldType, UIBuilder } from "@lark-base-open/js-sdk";
import { useTranslation, UseTranslationResponse } from "react-i18next";
import { FIELDS } from "./App";

export default memo(function Form({ onSubmit, bitable, tableId }: { onSubmit: Function; bitable: any; tableId: string }) {
	const translation = useTranslation();

	const allowedXAxisFields = FIELDS.getAllowedFields("X");
	const allowedDataFields = FIELDS.getAllowedFields("Y");

	const callback = async (uiBuilder: UIBuilder, { t }: UseTranslationResponse<"translation", undefined>) => {
		uiBuilder.form(
			form => ({
				formItems: [
					form.tableSelect("table", { label: "选择数据表" }),
					form.viewSelect("view", { label: "选择视图", sourceTable: "table" }),
					form.fieldSelect("xAxisField", { label: "X 轴字段", sourceTable: "table", multiple: false, filterByTypes: allowedXAxisFields }),
					form.fieldSelect("dataFields", { label: "数据字段", sourceTable: "table", multiple: false, filterByTypes: allowedDataFields }),
					form.select("chartType", {
						label: "图表类型",
						options: [
							{ label: "柱状图", value: "bar" },
							{ label: "折线图", value: "line" },
							{ label: "散点图", value: "scatter" },
						],
						defaultValue: "bar",
					}),
					// form.select("theme", {
					// 	label: "主题",
					// 	options: [
					// 		{ label: "默认", value: "default" },
					// 		{ label: "暗黑", value: "dark" },
					// 		{ label: "westeros", value: "westeros" },
					// 		{ label: "infographic", value: "infographic" },
					// 	],
					// 	defaultValue: "default",
					// }),
				],
				buttons: ["确定"],
			}),
			async ({ key, values }) => {
				if (!values.view) {
					uiBuilder.message.warning("请选择视图");
					return;
				}
				if (!(values.xAxisField && values.dataFields)) {
					uiBuilder.message.warning("请选择 X 轴字段和数据字段");
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
