import React, { useState, useEffect } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import useDialog from '@/hooks/useDialog'
import { DIALOG_HEADER } from '@/redux/constants/dialog'
import ContextMenu from '@/components/contextMenu2'
import useMenu from '@/hooks/useMenu'
import { findItem, getProcessID } from '@/utils/utils'
import { clearPassage } from '@/utils/services'
import { getProjectId } from '@/utils/auth'
import useCache from '@/hooks/useCache'

import { HeaderContainer, ContextMenuContainer } from './style'
import GridLayout from './components/GridLayout/index'

// 右键
const ContextMenuRightClick = ({ domId, current, layoutConfig }) => {
    const { openDialog } = useDialog()
    const { t } = useTranslation()
    const { subContextMenuId } = useMenu()
    const id = domId?.split('edit-')?.at(-1)

    const handleMenu = () => {
        subContextMenuId(id)
        openDialog({ type: DIALOG_HEADER })
    }
    const handleReset = (reset = true) => {
        if (getProjectId()) {
            clearPassage({ code: current?.code, reset })
        } else {
            message.error(t('模板里不能清零'))
        }
    }
    return (
        <ContextMenuContainer>
            <ContextMenu
                domId={domId}
                layoutConfig={layoutConfig}
            >
                <div
                    className="unique-content"
                    onClick={handleMenu}
                >
                    {t('编辑')}
                </div>
                {
                    current?.code && (
                        <div
                            className="unique-content"
                            onClick={() => handleReset()}
                        >
                            {t(`清零-${current.label}`)}
                        </div>
                    )
                }
                {
                    current?.code && (
                        <div
                            className="unique-content"
                            onClick={() => handleReset(false)}
                        >
                            {t(`恢复-${current.label}`)}
                        </div>
                    )
                }
            </ContextMenu>
        </ContextMenuContainer>
    )
}

const header = ({ id, item, layoutConfig }) => {
    const [data, setData] = useState({})
    const [current, setCurrent] = useState()
    const headerData = useSelector(state => state.template.headerData)
    const widgetData = useSelector(state => state.template.widgetData)
    const { deleteDataCache } = useCache()

    useEffect(() => {
        const widget = findItem(widgetData, 'widget_id', item.widget_id)
        if (widget && widget?.data_source) {
            const data_source = widget?.data_source
            // 结构，避免状态不更新
            setData({ ...headerData?.find(f => String(data_source) === f?.id) })
        }
    }, [item, widgetData, headerData])

    // 表头控件 定时清理表头buffer缓存
    useEffect(() => {
        if (!data?.variableCode) return () => {}

        const timer = setInterval(() => {
            deleteDataCache({
                key: `${getProcessID()}-${data?.variableCode}-UIData`
            })
        }, 10000)

        return () => {
            clearInterval(timer)
        }
    }, [data?.variableCode])

    const handleCallback = (e) => {
        setCurrent(e)
    }

    return (
        <>
            <HeaderContainer>
                <div
                    className="gridLayout"
                    style={{ background: data?.backgroundColor }}
                >
                    {data && <GridLayout initVal={data} domId={id} onCallback={handleCallback} />}
                </div>
            </HeaderContainer>
            <ContextMenuRightClick
                domId={id}
                current={current}
                layoutConfig={layoutConfig}
            />
        </>
    )
}
export default header
