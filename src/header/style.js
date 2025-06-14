import styled from 'styled-components'
import { VAR, rem } from '@/style/index'

export const HeaderContainer = styled.div`
    /* min-height: ${rem('30px')}; */
    /* height: ${VAR.layoutHeader} ; */
    /* padding: 0px 10px 0px 10px; */
    height: 100%;
    margin-bottom: 10px;
    width: 100%;
    z-index: 999;
    .gridLayout {
        padding: 3px;
        height: 100%;
        /* border-radius: 8px; */
    }

    .content {
        height: 100%;
        /* height:  ${VAR.layoutHeader} ; */
        background-color: #000;
        color: #FFF; 
    }
`
export const ContextMenuContainer = styled.div`
    .unique { 
        border-bottom: 1px solid rgba(220 ,220, 220,1);
        padding: 2px
    }
    .disabled {
        cursor: no-drop;
    }
    .unique-content {
        padding: 2px;
    }

`
