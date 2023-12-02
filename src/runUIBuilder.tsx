import { bitable, UIBuilder, FieldType } from "@lark-base-open/js-sdk";
import { UseTranslationResponse } from 'react-i18next';

export default async function(uiBuilder: UIBuilder, { t }: UseTranslationResponse<'translation', undefined>) {
  uiBuilder.form((form) => ({
    formItems: [
        form.tableSelect('table', { label: '选择数据表' }),
        form.viewSelect('view', { label: '选择视图', sourceTable: 'table' }),
        form.fieldSelect('field', { label: '选择字段', sourceTable: 'table', multiple: true }),
        form.input('text', { label: '输入文本', defaultValue: '文本默认值' }),
        form.inputNumber('number', { label: '输入数字', defaultValue: 28 }),
        form.textArea('textArea', { label: '输入多行文本' }),
        form.checkboxGroup('checkbox', { label: '选择水果', options: ['Apple', 'Orange'], defaultValue: ['Apple'] }),
        form.select('select', { label: '下拉选择器', options: [{ label: 'Apple', value: 'Apple' }, { label: 'Orange', value: 'Orange' }], defaultValue: 'Apple' }),
    ],
    buttons: ['确定', '取消'],
  }),
    async ({ key, values }) => {
      const { table, view, field, text, number, textArea, checkbox, select } = values;
      console.log(values)
      uiBuilder.markdown(`你点击了**${key}**按钮`);
    });
}