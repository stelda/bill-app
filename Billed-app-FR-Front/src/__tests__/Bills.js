/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import {formatDate, formatStatus} from "../app/format.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("then fetches bills from fixtures", async () => {
      document.body.innerHTML = BillsUI({data: bills})
      expect(bills.length).toBeGreaterThan(0)
    })

    /*========================= INITIAL UI Checks on the Bills Page =========================*/
    test("then bill icon in vertical layout should be highlighted", async () => {
      // Set up authentification
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Set up the document body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // Check if the bill icon is highlighted
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // Fix Bug #5 - complete expect statement
      expect(windowIcon).toHaveClass('active-icon');
    })

    test("then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({data: bills})
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // test to check if the new bill button is displayed
    test("then the new bill button should be displayed", () => {
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })

    // test to check if a table is displayed
    test("then the bills should be displayed", async () => {
      // check if the table exists
      const table = screen.getByTestId("tbody")
      expect(table).toBeTruthy()
      // check if the table has header content
      const headerContentColumn1  = await screen.getByText("Type")
      expect(headerContentColumn1).toBeTruthy()
      const headerContentColumn2  = await screen.getByText("Nom")
      expect(headerContentColumn2).toBeTruthy()
      const headerContentColumn3  = await screen.getByText("Date")
      expect(headerContentColumn3).toBeTruthy()
      const headerContentColumn4  = await screen.getByText("Montant")
      expect(headerContentColumn4).toBeTruthy()
      const headerContentColumn5  = await screen.getByText("Statut")
      expect(headerContentColumn5).toBeTruthy()
      const headerContentColumn6  = await screen.getByText("Actions")
      expect(headerContentColumn6).toBeTruthy()
    })
  })

  /*========================= USER INTERACTIONS WITH THE BILLS PAGE =========================*/
  // click on new bill button
  describe("When I click on New Bill button", () => {
    test("then it should navigate and display the new bill form", async () => {
      // Set up authentification
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Set up the document body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // check if the new bill button is displayed
      const newBillButton = screen.getByTestId('btn-new-bill')
      expect(newBillButton).toBeTruthy()
      userEvent.click(newBillButton)
      // check if the window location is new bill page
      await waitFor(() => expect(window.location.href).toBe('http://localhost/#employee/bill/new'))
      // check if the new bill form is displayed
      const newBillForm = await screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })
  })

  // click on eye icon
  describe("When I click on the eye icon", () => {
    test("then a modal should open", async () => {
      // Set up authentification
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Set up the document body
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Initialize the bills container
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })
      document.body.innerHTML = BillsUI({data: bills})

      // check if the eye icon is displayed
      const eyeIcons = screen.getAllByTestId('icon-eye')
      expect(eyeIcons).toBeTruthy()

      // check if the handleClickIconEye function (containers\Bills line23) is called
      const mockedHandleClickIconEye = jest.fn(eyeIcon => billsContainer.handleClickIconEye(eyeIcon))

      // replace the jquery modal function with a mock function
      $.fn.modal = jest.fn()

      // loop through the eye icons and click on each
      eyeIcons.forEach(eyeIcon => {
        eyeIcon.addEventListener('click', () => mockedHandleClickIconEye(eyeIcon))
        userEvent.click(eyeIcon)

        // check if the mockedHandleClickIconEye function is called
        expect(mockedHandleClickIconEye).toHaveBeenCalled()

        // check if the modal is opened
        expect(screen.getByText('Justificatif')).toBeTruthy()
      })

      // check if html element whose id is "modaleFile" has an attribute display set to block
      await waitFor(() => {
        const modal = screen.getByTestId('modaleFile')
        expect(modal).toHaveStyle("display: block")
      })
    })
  })
})

/*========================= INTEGRATION TEST =========================*/
describe("Given I am connected as an employee on Bills page", () => {
  describe("When I have bills to display", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills").mockImplementation(() => {
        return {
          list: () => Promise.resolve(bills)
        }
      });
    })

    test("then it should fetch the bills from mock API GET", async () => {
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const result = await billsInstance.getBills();
      expect(result).toEqual(bills.map(doc => ({
        ...doc,
        date: formatDate(doc.date),
        status: formatStatus(doc.status)
      })));
    });

    test("then bills should have a correct date", async () => {
      // regex for date format "4 Avr. 04"
      const expectedDateRegex = /^\d{1,2}\s(?:Jan\.|F[eé]v\.|Mar\.|Avr\.|Mai|Jui\.|Juil\.|Ao[uû]t|Sep\.|Oct\.|Nov\.|D[eé]c\.)\s\d{2}$/;
      // loop through the bills and check if the date is correct
      bills.forEach(bill => {
        const formattedDate = formatDate(bill.date)
        // check if there is a date
        expect(formattedDate).toBeTruthy()
        // check if the date is in the correct format
        expect(formattedDate).toMatch(expectedDateRegex)
      })
    })

    test("then bills should have a correct status", async () => {
      // regex for status format "pending|accepted|refused"
      const expectedStatus = /^(pending|accepted|refused)$/;
      // loop through the bills and check if the status is correct
      bills.forEach(bill => {
        const status = bill.status
        // check if there is a status
        expect(status).toBeTruthy()
        // check if the status is in the correct format
        expect(status).toMatch(expectedStatus)
      })
    })
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      // initialize mockSTore
      jest.spyOn(mockStore, "bills").mockReturnValue({
        list: () => Promise.resolve([])
      });

      Object.defineProperty(
          window,
          'localStorage',
          {value: localStorageMock}
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur/)
      expect(message).toBeTruthy()
    })
    test("then fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur/)
      expect(message).toBeTruthy()
    })
    afterEach(() => {
      jest.resetAllMocks()
    })
  })
})


